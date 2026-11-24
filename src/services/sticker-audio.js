// src/services/sticker-audio.js
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { downloadMediaMessage } from "baileys";

const execFileAsync = promisify(execFile);

export function createTempWorkdir(prefix = "figaudio-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function cleanupTempWorkdir(dirPath) {
  if (dirPath && fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

export function unwrapMessage(message) {
  if (!message) return null;
  if (message.ephemeralMessage?.message) {
    return unwrapMessage(message.ephemeralMessage.message);
  }
  if (message.viewOnceMessage?.message) {
    return unwrapMessage(message.viewOnceMessage.message);
  }
  if (message.viewOnceMessageV2?.message) {
    return unwrapMessage(message.viewOnceMessageV2.message);
  }
  if (message.documentWithCaptionMessage?.message) {
    return unwrapMessage(message.documentWithCaptionMessage.message);
  }
  return message;
}

export function getMediaType(waMessage) {
  const m = unwrapMessage(waMessage?.message);
  if (!m) return null;
  if (m.imageMessage) return "image";
  if (m.videoMessage) return "video";
  if (m.audioMessage) return "audio";
  if (m.stickerMessage) return "sticker";
  return null;
}

export function extractQuotedWAMessage(webMessage) {
  const m = unwrapMessage(webMessage?.message);
  if (!m) return null;

  const contentWithCtx =
    m.extendedTextMessage ||
    m.imageMessage ||
    m.videoMessage ||
    m.audioMessage ||
    m.stickerMessage;

  const ctx = contentWithCtx?.contextInfo;
  if (!ctx?.quotedMessage) return null;

  return {
    key: {
      remoteJid: webMessage.key.remoteJid,
      fromMe: false,
      id: ctx.stanzaId,
      participant: ctx.participant,
    },
    message: ctx.quotedMessage,
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
    }
  );
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

/**
 * Converte imagem, figurinha estática ou vídeo curto em figurinha .webp 512x512
 */
export async function buildWebpSticker(inputPath, outputPath, isAnimated = false) {
  if (isAnimated) {
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-t",
      "6",
      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=15",
      "-c:v",
      "libwebp",
      "-loop",
      "0",
      "-preset",
      "default",
      "-q:v",
      "70",
      "-an",
      "-vsync",
      "0",
      outputPath,
    ]);
  } else {
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
      "-c:v",
      "libwebp",
      "-lossless",
      "0",
      "-q:v",
      "80",
      "-an",
      outputPath,
    ]);
  }

  return fs.readFileSync(outputPath);
}

/**
 * Extrai ou converte áudio (de arquivo de áudio ou de vídeo) para OGG/Opus PTT
 */
export async function buildOpusAudio(inputPath, outputPath, maxSeconds = 20) {
  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-vn",
    "-t",
    String(maxSeconds),
    "-c:a",
    "libopus",
    "-b:a",
    "64k",
    "-ac",
    "1",
    "-ar",
    "48000",
    "-avoid_negative_ts",
    "make_zero",
    outputPath,
  ]);

  return fs.readFileSync(outputPath);
}

/**
 * Envia a figurinha e logo em seguida o áudio vinculado a ela
 */
export async function sendStickerWithAudio(socket, remoteJid, stickerBuffer, audioBuffer) {
  const sentSticker = await socket.sendMessage(remoteJid, {
    sticker: stickerBuffer,
  });

  await socket.sendMessage(
    remoteJid,
    {
      audio: audioBuffer,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    },
    { quoted: sentSticker }
  );
}
