// src/commands/member/inspecionar.js
import fs from "node:fs";
import path from "node:path";
import { downloadMediaMessage } from "baileys";
import { ASSETS_DIR, PREFIX } from "../../config.js";

// Cache em memória dos pacotes originais antes de serem cortados pelo quotedMessage
const rawMessageCache = new Map();
let listenerAttached = false;

function extractUnknownProtoSymbols(obj, prefix = "") {
  const unknowns = {};
  if (!obj || typeof obj !== "object") return unknowns;

  for (const sym of Object.getOwnPropertySymbols(obj)) {
    const val = obj[sym];
    const keyName = `${prefix || "root"}[${sym.toString()}]`;
    unknowns[keyName] = Buffer.isBuffer(val) ? val.toString("hex") : val;
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object" && !Buffer.isBuffer(val)) {
      Object.assign(
        unknowns,
        extractUnknownProtoSymbols(val, prefix ? `${prefix}.${key}` : key)
      );
    }
  }
  return unknowns;
}

function attachRawListener(socket) {
  if (listenerAttached || !socket?.ev) return;
  listenerAttached = true;

  socket.ev.on("messages.upsert", ({ messages }) => {
    for (const m of messages || []) {
      const id = m?.key?.id;
      const jid = m?.key?.remoteJid;
      if (!id || !m?.message) continue;

      const isSticker =
        Boolean(m.message.stickerMessage) ||
        JSON.stringify(m.message).includes("sticker");

      if (isSticker) {
        const entry = {
          id,
          jid,
          timestamp: Date.now(),
          fullMessage: m,
          unknownSymbols: extractUnknownProtoSymbols(m),
        };
        rawMessageCache.set(id, entry);
        rawMessageCache.set(`last:${jid}`, entry);

        // Limpa entradas com mais de 5 minutos
        for (const [k, v] of rawMessageCache.entries()) {
          if (Date.now() - v.timestamp > 5 * 60 * 1000) {
            rawMessageCache.delete(k);
          }
        }
      }
    }
  });
}

function inspectRiffChunks(buf) {
  const chunks = [];
  if (!Buffer.isBuffer(buf) || buf.length < 12) return chunks;
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    return [{ fourcc: buf.toString("ascii", 0, 4), size: buf.length, note: "not RIFF/WEBP" }];
  }

  let offset = 12;
  while (offset + 8 <= buf.length) {
    const fourcc = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = Math.min(dataStart + size, buf.length);
    const chunkData = buf.subarray(dataStart, dataEnd);

    const info = {
      fourcc,
      size,
      previewHex: chunkData.subarray(0, 16).toString("hex"),
    };

    if (fourcc === "EXIF" || fourcc === "XMP ") {
      info.utf8Text = chunkData.toString("utf8").replace(/[^\x20-\x7EÀ-ÿ]/g, "");
    }

    chunks.push(info);
    offset = dataStart + size + (size % 2);
  }

  return chunks;
}

function scanAudioSignatures(buf) {
  const sigs = [
    { name: "OGG/OPUS", bytes: Buffer.from("OggS", "ascii") },
    { name: "MP4/AAC (ftyp)", bytes: Buffer.from("ftyp", "ascii") },
    { name: "MP3 (ID3)", bytes: Buffer.from("ID3", "ascii") },
    { name: "WAV (WAVE)", bytes: Buffer.from("WAVE", "ascii") },
  ];
  const found = [];
  for (const s of sigs) {
    const idx = buf.indexOf(s.bytes);
    if (idx !== -1) found.push(`${s.name} @ offset ${idx}`);
  }
  return found;
}

export default {
  name: "inspecionar",
  description: "Raio-X completo do pacote original (Symbols Protobuf, JSON bruto e WebP)",
  commands: ["inspecionar", "inspect", "raw"],
  usage: `${PREFIX}inspecionar`,
  execute: async ({ socket, webMessage, sendReply, sendErrorReply }) => {
    attachRawListener(socket);

    const jid = webMessage.key.remoteJid;
    const ctx =
      webMessage?.message?.extendedTextMessage?.contextInfo ||
      webMessage?.message?.imageMessage?.contextInfo ||
      webMessage?.message?.videoMessage?.contextInfo ||
      webMessage?.message?.audioMessage?.contextInfo ||
      webMessage?.message?.stickerMessage?.contextInfo;

    const quoted = ctx?.quotedMessage;
    const cached =
      (ctx?.stanzaId && rawMessageCache.get(ctx.stanzaId)) ||
      rawMessageCache.get(`last:${jid}`);

    const targetMessage = cached?.fullMessage?.message || quoted;

    if (!targetMessage) {
      await sendReply(
        `Listener ativado! Envie a figurinha com som agora e depois use *${PREFIX}inspecionar* (respondendo ou logo em seguida).`
      );
      return;
    }

    const unknownSymbols = cached?.unknownSymbols || extractUnknownProtoSymbols(targetMessage);
    const rawJson = JSON.stringify(targetMessage, null, 2);

    console.log("[INSPECT RAW ORIGINAL JSON]", rawJson);
    console.log("[INSPECT UNKNOWN SYMBOLS]", JSON.stringify(unknownSymbols, null, 2));

    const mediaMsg = cached?.fullMessage || (quoted?.stickerMessage
      ? {
          key: {
            remoteJid: jid,
            id: ctx.stanzaId,
            participant: ctx.participant,
          },
          message: quoted,
        }
      : null);

    let binarySummary = "";
    if (mediaMsg?.message?.stickerMessage) {
      try {
        const buffer = await downloadMediaMessage(
          mediaMsg,
          "buffer",
          {},
          {
            logger: undefined,
            reuploadRequest: socket.updateMediaMessage,
          }
        );

        const chunks = inspectRiffChunks(buffer);
        const audioSigs = scanAudioSignatures(buffer);
        const exifChunk = chunks.find((c) => c.fourcc === "EXIF" || c.fourcc === "XMP ");

        const outDir = path.join(ASSETS_DIR, "temp");
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, `sound-sticker-${Date.now()}.webp`), buffer);

        binarySummary =
          `📦 *Bytes WebP:* ${buffer.length}\n` +
          `🔊 *Assinaturas Áudio:* ${audioSigs.length ? audioSigs.join(", ") : "Nenhuma"}\n` +
          (exifChunk?.utf8Text ? `🏷️ *EXIF/XMP:* ${exifChunk.utf8Text.slice(0, 300)}\n` : "");
      } catch (err) {
        binarySummary = `⚠️ *Erro mídia:* ${err.message}\n`;
      }
    }

    const hasSymbols = Object.keys(unknownSymbols).length > 0;
    const sourceLabel = cached ? "✅ Pacote Original Capturado" : "⚠️ Apenas Quoted (envie o sticker novamente para capturar o original)";

    await sendReply(
      `${sourceLabel}\n` +
      binarySummary +
      `🕵️ *Symbols Protobuf:* ${hasSymbols ? "\n```json\n" + JSON.stringify(unknownSymbols, null, 2).slice(0, 1200) + "\n```" : "Nenhum"}\n\n` +
      `📄 *JSON da Mensagem:*\n` +
      "```json\n" +
      rawJson.slice(0, 2000) +
      "\n```"
    );
  },
};
