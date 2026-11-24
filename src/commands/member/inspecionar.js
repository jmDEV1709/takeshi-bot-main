// src/commands/member/inspecionar.js
import fs from "node:fs";
import path from "node:path";
import { downloadMediaMessage } from "baileys";
import webpmux from "node-webpmux";
import { ASSETS_DIR, PREFIX } from "../../config.js";

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

    // Se for EXIF ou XMP, extrai o texto legível (onde o WhatsApp guarda JSONs internos)
    if (fourcc === "EXIF" || fourcc === "XMP ") {
      info.utf8Text = chunkData.toString("utf8").replace(/[^\x20-\x7EÀ-ÿ]/g, "");
    }

    chunks.push(info);
    offset = dataStart + size + (size % 2);
  }

  return chunks;
}

// Procura assinaturas de codecs de áudio escondidas em qualquer byte do arquivo
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

// Extrai campos desconhecidos do Protobuf ($unknown) que o JSON.stringify ignora
function extractUnknownProtoFields(obj, prefix = "") {
  const unknowns = {};
  if (!obj || typeof obj !== "object") return unknowns;

  if (obj.$unknown) {
    unknowns[prefix || "root"] = Buffer.isBuffer(obj.$unknown)
      ? obj.$unknown.toString("hex")
      : obj.$unknown;
  }

  for (const key of Object.keys(obj)) {
    if (key === "$unknown") continue;
    const val = obj[key];
    if (val && typeof val === "object" && !Buffer.isBuffer(val)) {
      Object.assign(unknowns, extractUnknownProtoFields(val, prefix ? `${prefix}.${key}` : key));
    }
  }
  return unknowns;
}

export default {
  name: "inspecionar",
  description: "Raio-X completo (Proto oculto, EXIF, Chunks e Codecs) da figurinha citada",
  commands: ["inspecionar", "inspect", "raw"],
  usage: `${PREFIX}inspecionar`,
  handle: async ({ socket, webMessage, sendReply, sendErrorReply }) => {
    const ctx =
      webMessage?.message?.extendedTextMessage?.contextInfo ||
      webMessage?.message?.imageMessage?.contextInfo ||
      webMessage?.message?.videoMessage?.contextInfo ||
      webMessage?.message?.audioMessage?.contextInfo ||
      webMessage?.message?.stickerMessage?.contextInfo;

    const quoted = ctx?.quotedMessage;
    if (!quoted) {
      await sendReply(`Responda à figurinha com som usando *${PREFIX}inspecionar*`);
      return;
    }

    const unknownFields = extractUnknownProtoFields(quoted);
    const json = JSON.stringify(quoted, null, 2);

    console.log("[INSPECT JSON]", json);
    console.log("[INSPECT UNKNOWN PROTO]", JSON.stringify(unknownFields, null, 2));

    const mediaMsg = quoted.stickerMessage
      ? {
        key: {
          remoteJid: webMessage.key.remoteJid,
          id: ctx.stanzaId,
          participant: ctx.participant,
        },
        message: quoted,
      }
      : null;

    if (!mediaMsg) {
      await sendReply("```json\n" + json.slice(0, 3500) + "\n```");
      return;
    }

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

      const outDir = path.join(ASSETS_DIR, "temp");
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, `sound-sticker-${Date.now()}.webp`);
      fs.writeFileSync(outFile, buffer);

      const report = {
        byteLength: buffer.length,
        unknownProtoFields: unknownFields,
        audioSignaturesInBinary: audioSigs,
        chunks,
      };

      console.log("[INSPECT FULL REPORT]", JSON.stringify(report, null, 2));

      await sendReply(
        `📦 *Bytes:* ${buffer.length}\n` +
        `🕵️ *Proto Oculto:* ${Object.keys(unknownFields).length ? JSON.stringify(unknownFields) : "Nenhum no quoted"}\n` +
        `🔊 *Assinaturas Áudio:* ${audioSigs.length ? audioSigs.join(", ") : "Nenhuma no .webp"}\n\n` +
        "```json\n" +
        JSON.stringify(chunks, null, 2).slice(0, 2600) +
        "\n```"
      );
    } catch (err) {
      await sendErrorReply(`Falha ao baixar/ler o binário: ${err.message}`);
    }
  },
};
