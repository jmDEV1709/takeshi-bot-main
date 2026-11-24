// src/commands/member/figvideo.js
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

export default {
  name: "figvideo",
  description: "Converte um vídeo em figurinha animada e extrai o áudio do próprio vídeo.",
  commands: ["figvideo", "figvid", "vfig"],
  usage: `${PREFIX}figvideo (envie ou responda a um vídeo)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    webMessage,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    const quoted = extractQuotedWAMessage(webMessage);

    const videoMsg =
      getMediaType(webMessage) === "video"
        ? webMessage
        : quoted && getMediaType(quoted) === "video"
          ? quoted
          : null;

    if (!videoMsg) {
      await sendErrorReply(
        `Envie um *vídeo* com a legenda *${PREFIX}figvideo* ou responda a um vídeo com *${PREFIX}figvideo*.`
      );
      return;
    }

    const workdir = createTempWorkdir("figvideo-");
    const videoInput = path.join(workdir, "input.mp4");
    const stickerOutput = path.join(workdir, "sticker.webp");
    const audioOutput = path.join(workdir, "audio.ogg");

    try {
      await sendSuccessReact();
      await downloadMediaToFile(socket, videoMsg, videoInput);

      const stickerBuffer = await buildWebpSticker(videoInput, stickerOutput, true);

      let audioBuffer = null;
      try {
        audioBuffer = await buildOpusAudio(videoInput, audioOutput, 15);
      } catch {
        // Caso o vídeo seja mudo (sem faixa de áudio), envia apenas a figurinha animada
        audioBuffer = null;
      }

      if (audioBuffer && audioBuffer.length > 0) {
        await sendStickerWithAudio(socket, remoteJid, stickerBuffer, audioBuffer);
      } else {
        await socket.sendMessage(remoteJid, { sticker: stickerBuffer });
      }
    } catch (error) {
      await sendErrorReply(`Erro ao converter vídeo em figurinha com áudio: ${error.message}`);
    } finally {
      cleanupTempWorkdir(workdir);
    }
  },
};