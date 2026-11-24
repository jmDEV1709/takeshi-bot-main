// Substituto para src/services/sticker-audio.js no Takeshi Bot.
// O comando figsom já tem o alias "figaudio" e já faz o pareamento visual + áudio.
// Esta versão troca o envio de duas mensagens por um sound sticker em uma mensagem.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  downloadMediaMessage,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto,
} from "baileys";

const execFileAsync = promisify(execFile);
const MAX_SOUND_SECONDS = 10;
const AUDIO_STICKER_FIELD = 134;
const STICKER_FIELD = 26;
const AUDIO_FIELD_IN_STICKER = 26;
const CONTEXT_INFO_FIELD = 17;
const MEDIA_DOMAIN_INFO_FIELD = 74;

const Writer = proto.Message.encode(proto.Message.create()).constructor;
const originalMessageEncode = proto.Message.encode;
const pendingAudioStickers = new Map();
let encodePatchInstalled = false;

function getStickerHash(sticker) {
  const hash = sticker?.fileSha256;
  return hash ? Buffer.from(hash).toString("hex") : null;
}

function writeMediaDomainContext(hash) {
  // ContextInfo.mediaDomainInfo (field 74): { mediaKeyDomain: 1, e2EeMediaKey: hash }
  const domain = new Writer();
  domain.uint32((1 << 3) | 0).uint32(1);
  domain.uint32((2 << 3) | 2).bytes(hash);

  const context = new Writer();
  context.uint32((MEDIA_DOMAIN_INFO_FIELD << 3) | 2).bytes(domain.finish());
  return context.finish();
}

function encodeStickerWithAudio(sticker, audio) {
  const stickerWriter = new Writer();
  proto.Message.StickerMessage.encode(sticker, stickerWriter);
  stickerWriter
    .uint32((CONTEXT_INFO_FIELD << 3) | 2)
    .bytes(writeMediaDomainContext(sticker.fileSha256));

  const audioWriter = new Writer();
  proto.Message.AudioMessage.encode(audio, audioWriter);
  audioWriter
    .uint32((CONTEXT_INFO_FIELD << 3) | 2)
    .bytes(writeMediaDomainContext(audio.fileSha256));

  // StickerMessage.audioMessage = field 26
  stickerWriter
    .uint32((AUDIO_FIELD_IN_STICKER << 3) | 2)
    .bytes(audioWriter.finish());

  // FutureProofMessage { Message message = 1 } containing Message.stickerMessage = 26
  const innerMessage = new Writer();
  innerMessage
    .uint32((STICKER_FIELD << 3) | 2)
    .bytes(stickerWriter.finish());

  const futureProof = new Writer();
  futureProof.uint32((1 << 3) | 2).bytes(innerMessage.finish());
  return futureProof.finish();
}

function installAudioStickerEncoder() {
  if (encodePatchInstalled) return;

  const appendRawBytes = (writer, bytes) => {
    if (typeof writer._reserve === "function" && typeof writer.pos === "number") {
      writer._reserve(bytes.length);
      writer.buf.set(bytes, writer.pos);
      writer.pos += bytes.length;
      return writer;
    }
    // protobufjs 7 BufferWriter, usado pelo baileys@7.0.0-rc14.
    writer._push((chunk, buffer, position) => buffer.set(chunk, position), bytes.length, bytes);
    return writer;
  };

  // Baileys rc14 doesn't know Message field 134. Keep the normal public object
  // { stickerMessage } for message generation, and write its wire representation
  // as audioStickerMessage only during the final protobuf encode.
  proto.Message.encode = function encodeMessageWithAudioSticker(message, writer) {
    const key = message?.stickerMessage ? getStickerHash(message.stickerMessage) : null;
    const soundStickerBytes = key ? pendingAudioStickers.get(key) : null;

    if (!soundStickerBytes) {
      return originalMessageEncode.call(this, message, writer);
    }

    const { stickerMessage: _stickerMessage, ...rest } = message;
    // Codifica a mensagem sem sticker num writer limpo, acrescenta o campo
    // 134 e só então o anexa ao writer do chamador. O encoder gerado do Baileys
    // usa fork/ldelim; escrever direto nesse writer pode deslocar a fronteira
    // do FutureProofMessage em alguns caminhos de mídia estática.
    const replacement = new Writer();
    originalMessageEncode.call(this, rest, replacement);
    replacement.uint32((AUDIO_STICKER_FIELD << 3) | 2).bytes(soundStickerBytes);
    const encoded = replacement.finish();

    return writer ? appendRawBytes(writer, encoded) : appendRawBytes(new Writer(), encoded);
  };

  encodePatchInstalled = true;
}

function webpIsAnimated(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) return false;
  // Animated WebP contains ANIM/ANMF chunks. Checking bytes is sufficient for
  // this RIFF-based container and avoids mislabeling static stickers.
  return buffer.includes(Buffer.from("ANIM")) || buffer.includes(Buffer.from("ANMF"));
}

export function createTempWorkdir(prefix = "figaudio-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function cleanupTempWorkdir(dirPath) {
  if (dirPath && fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

export function unwrapMessage(message) {
  let current = message;
  const wrappers = [
    "ephemeralMessage",
    "viewOnceMessage",
    "viewOnceMessageV2",
    "viewOnceMessageV2Extension",
    "documentWithCaptionMessage",
  ];

  for (let i = 0; current && i < 8; i++) {
    const wrapper = wrappers.find((name) => current?.[name]?.message);
    if (wrapper) {
      current = current[wrapper].message;
      continue;
    }
    break;
  }
  return current || null;
}

export function getMediaType(waMessage) {
  const message = unwrapMessage(waMessage?.message);
  if (!message) return null;
  if (message.imageMessage) return "image";
  if (message.videoMessage || message.ptvMessage) return "video";
  if (message.audioMessage) return "audio";
  if (message.stickerMessage) return "sticker";
  return null;
}

export function extractQuotedWAMessage(webMessage) {
  const message = unwrapMessage(webMessage?.message);
  if (!message) return null;

  const contentWithContext =
    message.extendedTextMessage ||
    message.imageMessage ||
    message.videoMessage ||
    message.audioMessage ||
    message.stickerMessage;
  const context = contentWithContext?.contextInfo;
  if (!context?.quotedMessage) return null;

  return {
    key: {
      remoteJid: webMessage.key.remoteJid,
      fromMe: false,
      id: context.stanzaId,
      participant: context.participant,
    },
    message: context.quotedMessage,
  };
}

export async function downloadMediaToFile(socket, waMessage, outputPath) {
  const buffer = await downloadMediaMessage(
    waMessage,
    "buffer",
    {},
    {
      logger: undefined,
      reuploadRequest: socket.updateMediaMessage,
    },
  );
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

/** Converte imagem, figurinha estática ou vídeo curto para WebP 512x512. */
export async function buildWebpSticker(inputPath, outputPath, isAnimated = false) {
  const qualityLevels = isAnimated ? [55, 45, 35, 25, 18, 12] : [80, 65, 50, 35, 25];
  let lastSize = 0;

  for (const quality of qualityLevels) {
    const args = isAnimated
      ? [
          "-hide_banner", "-loglevel", "error", "-y", "-i", inputPath,
          "-t", "6",
          "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=12",
          "-c:v", "libwebp", "-loop", "0", "-preset", "default",
          "-q:v", String(quality), "-an", outputPath,
        ]
      : [
          "-hide_banner", "-loglevel", "error", "-y", "-i", inputPath,
          "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
          "-c:v", "libwebp", "-q:v", String(quality), "-an", outputPath,
        ];

    await execFileAsync("ffmpeg", args);
    lastSize = fs.statSync(outputPath).size;
    if (lastSize <= 470 * 1024) break;
  }

  if (lastSize > 500 * 1024) {
    throw new Error(`Figurinha ficou com ${Math.ceil(lastSize / 1024)} KB; reduza a duração ou escolha uma imagem mais simples.`);
  }
  return fs.readFileSync(outputPath);
}

/** Converte MP3/áudio/vídeo em OGG/Opus mono, truncado a no máximo 10 s. */
export async function buildOpusAudio(inputPath, outputPath, maxSeconds = MAX_SOUND_SECONDS) {
  const seconds = Math.max(1, Math.min(Number(maxSeconds) || MAX_SOUND_SECONDS, MAX_SOUND_SECONDS));
  await execFileAsync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-i", inputPath,
    "-vn", "-t", String(seconds), "-c:a", "libopus", "-b:a", "48k",
    "-ac", "1", "-ar", "48000", "-avoid_negative_ts", "make_zero", outputPath,
  ]);
  return fs.readFileSync(outputPath);
}

/**
 * Envia um sound sticker como UMA mensagem.
 * Mantém a assinatura usada por figsom.js e figvideo.js.
 */
export async function sendStickerWithAudio(socket, remoteJid, stickerBuffer, audioBuffer) {
  if (!Buffer.isBuffer(stickerBuffer) || stickerBuffer.length === 0) {
    throw new Error("Não recebi os bytes da figurinha.");
  }
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw new Error("Não recebi os bytes do áudio.");
  }

  installAudioStickerEncoder();

  const stickerMedia = await prepareWAMessageMedia(
    { sticker: stickerBuffer, isAnimated: webpIsAnimated(stickerBuffer) },
    { upload: socket.waUploadToServer },
  );
  const audioMedia = await prepareWAMessageMedia(
    { audio: audioBuffer, mimetype: "audio/ogg; codecs=opus" },
    { upload: socket.waUploadToServer },
  );

  const sticker = stickerMedia.stickerMessage;
  const audio = audioMedia.audioMessage;

  sticker.width = 512;
  sticker.height = 512;
  sticker.isAnimated = webpIsAnimated(stickerBuffer);
  sticker.isAvatar = false;
  sticker.isAiSticker = false;
  sticker.isLottie = false;
  sticker.accessibilityLabel ||= "🔊";

  // O arquivo já está cortado a 10 s em buildOpusAudio. Evita que um PTT seja
  // anunciado por engano e preserva o áudio como mídia normal de figurinha.
  audio.mimetype = "audio/ogg; codecs=opus";
  audio.ptt = false;
  audio.seconds = Math.min(Number(audio.seconds) || MAX_SOUND_SECONDS, MAX_SOUND_SECONDS);

  const outgoing = generateWAMessageFromContent(
    remoteJid,
    { stickerMessage: sticker },
    { userJid: socket.user?.id },
  );

  const preparedSticker = outgoing.message?.stickerMessage;
  const hash = getStickerHash(preparedSticker);
  if (!hash) throw new Error("Baileys não retornou o hash da figurinha preparada.");

  pendingAudioStickers.set(hash, encodeStickerWithAudio(preparedSticker, audio));
  try {
    await socket.relayMessage(remoteJid, outgoing.message, {
      messageId: outgoing.key.id,
    });
  } finally {
    pendingAudioStickers.delete(hash);
  }

  return outgoing;
}

/**
 * Disponível para leitura se o bot estiver usando um protobuf que decodifica
 * Message.audioStickerMessage (134) e StickerMessage.audioMessage (26).
 */
export function getAudioStickerParts(webMessage) {
  const message = unwrapMessage(webMessage?.message);
  const inside = unwrapMessage(message?.audioStickerMessage?.message);
  const sticker = inside?.stickerMessage;
  const audio = sticker?.audioMessage;
  return sticker && audio ? { sticker, audio } : null;
}

/** Baixa o áudio embutido, não confundir com um áudio enviado em mensagem à parte. */
export async function downloadEmbeddedStickerAudio(socket, webMessage) {
  const parts = getAudioStickerParts(webMessage);
  if (!parts) return null;

  const regularAudioMessage = {
    ...webMessage,
    message: { audioMessage: parts.audio },
  };
  const buffer = await downloadMediaMessage(
    regularAudioMessage,
    "buffer",
    {},
    { logger: undefined, reuploadRequest: socket.updateMediaMessage },
  );
  return { ...parts, buffer };
}
