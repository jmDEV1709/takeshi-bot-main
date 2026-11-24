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
    const previewHex = buf.subarray(dataStart, Math.min(dataStart + 16, dataEnd)).toString("hex");

    chunks.push({
      fourcc,
      size,
      previewHex,
    });

    // RIFF chunks são alinhados em 2 bytes (padding se size for ímpar)
    offset = dataStart + size + (size % 2);
  }

  return chunks;
}

export default {
  name: "inspecionar",
  description: "Mostra o JSON e os chunks internos do binário da mensagem citada",
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

    const json = JSON.stringify(quoted, null, 2);
    console.log("[INSPECT JSON]", json);

    const mediaMsg = quoted.stickerMessage
      ? { key: { remoteJid: webMessage.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant }, message: quoted }
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
      const outDir = path.join(ASSETS_DIR, "temp");
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, `sound-sticker-${Date.now()}.webp`);
      fs.writeFileSync(outFile, buffer);

      let muxInfo = {};
      try {
        const img = new webpmux.Image();
        await img.load(buffer);
        muxInfo = {
          hasExif: Boolean(img.exif && img.exif.length > 0),
          hasXmp: Boolean(img.xmp && img.xmp.length > 0),
          hasAnim: Boolean(img.anim),
          width: img.width,
          height: img.height,
        };
      } catch (e) {
        muxInfo = { webpmuxError: e.message };
      }

      const report = {
        byteLength: buffer.length,
        savedFile: outFile,
        muxInfo,
        chunks,
      };

      console.log("[INSPECT BIN]", JSON.stringify(report, null, 2));

      await sendReply(
        `📦 *Binário extraído:* ${buffer.length} bytes\n` +
          `🧩 *Chunks:* ${chunks.map((c) => `${c.fourcc} (${c.size}B)`).join(", ")}\n` +
          `ℹ️ *Mux:* ${JSON.stringify(muxInfo)}\n\n` +
          "```json\n" +
          JSON.stringify(chunks, null, 2).slice(0, 2800) +
          "\n```"
      );
    } catch (err) {
      await sendErrorReply(`Falha ao baixar/ler o binário: ${err.message}`);
    }
  },
};