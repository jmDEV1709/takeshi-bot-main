// src/commands/member/figsom.js
import fs from "node:fs";
import path from "node:path";
import { PREFIX } from "../../config.js";
import {
  buildOpusAudio,
  buildWebpSticker,
  cleanupTempWorkdir,
  createTempWorkdir,
  downloadMediaToFile,
  extractQuotedWAMessage,
  getMediaType,
  sendStickerWithAudio,
} from "../../services/sticker-audio.js";

// Guarda mídia pendente por usuário (chave: `${remoteJid}:${senderJid}`) por 2 minutos
const pendingMedia = new Map();

function savePending(key, payload) {
  const existing = pendingMedia.get(key);
  if (existing?.timer) clearTimeout(existing.timer);

  const timer = setTimeout(() => {
    cleanupTempWorkdir(payload.workdir);
    pendingMedia.delete(key);
  }, 120_000);

  pendingMedia.set(key, { ...payload, timer });
}

function consumePending(key) {
  const item = pendingMedia.get(key);
  if (!item) return null;
  clearTimeout(item.timer);
  pendingMedia.delete(key);
  return item;
}

export default {
  name: "figsom",
  description: "Cria figurinha a partir de foto ou figurinha estática com o áudio que você escolher.",
  commands: ["figsom", "figaudio", "saudio"],
  usage: `${PREFIX}figsom`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    userJid,
    userLid,
    webMessage,
    sendReply,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    const senderJid =
      userJid ||
      userLid ||
      webMessage?.key?.participant ||
      webMessage?.key?.participantAlt ||
      remoteJid;

    const sessionKey = `${remoteJid}:${senderJid}`;
    const currentType = getMediaType(webMessage);
    const quoted = extractQuotedWAMessage(webMessage);
    const quotedType = quoted ? getMediaType(quoted) : null;

    let visualMsg = null;
    let visualType = null;
    let audioMsg = null;

    if (currentType === "image" || currentType === "sticker") {
      visualMsg = webMessage;
      visualType = currentType;
    } else if (quotedType === "image" || quotedType === "sticker") {
      visualMsg = quoted;
      visualType = quotedType;
    }

    if (currentType === "audio") {
      audioMsg = webMessage;
    } else if (quotedType === "audio" || quotedType === "video") {
      audioMsg = quoted;
    }

    // Caso 1: Temos imagem/figurinha E áudio na mesma interação
    if (visualMsg && audioMsg) {
      const workdir = createTempWorkdir("figsom-");
      const visualInput = path.join(workdir, visualType === "sticker" ? "in.webp" : "in.jpg");
      const audioInput = path.join(workdir, "audio_in");
      const stickerOut = path.join(workdir, "out.webp");
      const audioOut = path.join(workdir, "out.ogg");

      try {
        await sendSuccessReact();
        await downloadMediaToFile(socket, visualMsg, visualInput);
        await downloadMediaToFile(socket, audioMsg, audioInput);

        const stickerBuffer =
          visualType === "sticker"
            ? fs.readFileSync(visualInput)
            : await buildWebpSticker(visualInput, stickerOut, false);

        const audioBuffer = await buildOpusAudio(audioInput, audioOut, 20);

        await sendStickerWithAudio(socket, remoteJid, stickerBuffer, audioBuffer);
      } catch (error) {
        await sendErrorReply(`Erro ao juntar figurinha e áudio: ${error.message}`);
      } finally {
        cleanupTempWorkdir(workdir);
      }
      return;
    }

    // Caso 2: Usuário mandou/citou só a IMAGEM ou FIGURINHA
    if (visualMsg && !audioMsg) {
      const pending = consumePending(sessionKey);

      // Se já tinha um áudio guardado esperando, finaliza agora!
      if (pending?.kind === "audio") {
        const visualInput = path.join(
          pending.workdir,
          visualType === "sticker" ? "in.webp" : "in.jpg"
        );
        const stickerOut = path.join(pending.workdir, "out.webp");

        try {
          await sendSuccessReact();
          await downloadMediaToFile(socket, visualMsg, visualInput);

          const stickerBuffer =
            visualType === "sticker"
              ? fs.readFileSync(visualInput)
              : await buildWebpSticker(visualInput, stickerOut, false);

          await sendStickerWithAudio(socket, remoteJid, stickerBuffer, pending.audioBuffer);
        } catch (error) {
          await sendErrorReply(`Erro ao criar figurinha com áudio: ${error.message}`);
        } finally {
          cleanupTempWorkdir(pending.workdir);
        }
        return;
      }

      // Guarda a imagem/figurinha e pede o áudio
      if (pending) cleanupTempWorkdir(pending.workdir);
      const workdir = createTempWorkdir("figsom-wait-");
      const visualInput = path.join(workdir, visualType === "sticker" ? "in.webp" : "in.jpg");
      const stickerOut = path.join(workdir, "out.webp");

      try {
        await downloadMediaToFile(socket, visualMsg, visualInput);
        const stickerBuffer =
          visualType === "sticker"
            ? fs.readFileSync(visualInput)
            : await buildWebpSticker(visualInput, stickerOut, false);

        savePending(sessionKey, {
          kind: "sticker",
          workdir,
          stickerBuffer,
        });

        await sendReply(
          `🖼️ Imagem/figurinha salva! Agora responda a qualquer *áudio* com *${PREFIX}figsom* (ou mande o áudio com legenda *${PREFIX}figsom*) em até 2 minutos.`
        );
      } catch (error) {
        cleanupTempWorkdir(workdir);
        await sendErrorReply(`Erro ao preparar imagem: ${error.message}`);
      }
      return;
    }

    // Caso 3: Usuário mandou/citou só o ÁUDIO
    if (audioMsg && !visualMsg) {
      const pending = consumePending(sessionKey);

      // Se já tinha uma imagem/figurinha guardada esperando, finaliza agora!
      if (pending?.kind === "sticker") {
        const audioInput = path.join(pending.workdir, "audio_in");
        const audioOut = path.join(pending.workdir, "out.ogg");

        try {
          await sendSuccessReact();
          await downloadMediaToFile(socket, audioMsg, audioInput);
          const audioBuffer = await buildOpusAudio(audioInput, audioOut, 20);

          await sendStickerWithAudio(socket, remoteJid, pending.stickerBuffer, audioBuffer);
        } catch (error) {
          await sendErrorReply(`Erro ao aplicar áudio na figurinha: ${error.message}`);
        } finally {
          cleanupTempWorkdir(pending.workdir);
        }
        return;
      }

      // Guarda o áudio e pede a foto ou figurinha
      if (pending) cleanupTempWorkdir(pending.workdir);
      const workdir = createTempWorkdir("figsom-wait-");
      const audioInput = path.join(workdir, "audio_in");
      const audioOut = path.join(workdir, "out.ogg");

      try {
        await downloadMediaToFile(socket, audioMsg, audioInput);
        const audioBuffer = await buildOpusAudio(audioInput, audioOut, 20);

        savePending(sessionKey, {
          kind: "audio",
          workdir,
          audioBuffer,
        });

        await sendReply(
          `🔊 Áudio salvo! Agora responda a uma *foto* ou *figurinha estática* com *${PREFIX}figsom* (ou envie uma foto com legenda *${PREFIX}figsom*) em até 2 minutos.`
        );
      } catch (error) {
        cleanupTempWorkdir(workdir);
        await sendErrorReply(`Erro ao preparar áudio: ${error.message}`);
      }
      return;
    }

    // Caso 4: Sem mídia nem citação
    await sendErrorReply(
      `Como usar *${PREFIX}figsom*:\n` +
        `1️⃣ Responda a um *áudio* enviando uma *foto* com legenda *${PREFIX}figsom*.\n` +
        `2️⃣ Ou responda a uma *figurinha/foto* com *${PREFIX}figsom* e depois responda ao *áudio* escolhido com *${PREFIX}figsom*.`
    );
  },
};