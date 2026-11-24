import path from "node:path";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { createSticker } from "../../services/sticker.js";
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
  name: "sticker",
  description: "Cria figurinha de foto ou transforma vídeo em figurinha animada com o áudio original.",
  // Mantém os aliases atuais; /fig não é registrado em outro comando.
  commands: ["f", "s", "sticker", "fig"],
  usage: `${PREFIX}sticker (marque ou responda uma imagem/gif/vídeo)`,
  /**
   * @param {CommandHandleProps} paramsHandler
   */
  handle: async (paramsHandler) => {
    const {
      socket,
      remoteJid,
      webMessage,
      sendWaitReact,
      sendSuccessReact,
    } = paramsHandler;
    let { isImage, isVideo } = paramsHandler;

    // Clona a mensagem para não alterar a referência original.
    const normalizedWebMessage = JSON.parse(JSON.stringify(webMessage));
    const quotedMsg =
      normalizedWebMessage?.message?.extendedTextMessage?.contextInfo
        ?.quotedMessage;
    const targetMsg = quotedMsg || normalizedWebMessage?.message;

    // Remove o wrapper de visualização única antes de baixar a mídia.
    const viewOnceContent =
      targetMsg?.viewOnceMessage?.message ||
      targetMsg?.viewOnceMessageV2?.message ||
      targetMsg?.viewOnceMessageV2Extension?.message;

    if (viewOnceContent) {
      if (viewOnceContent.imageMessage) {
        delete viewOnceContent.imageMessage.viewOnce;
        if (quotedMsg) {
          normalizedWebMessage.message.extendedTextMessage.contextInfo.quotedMessage = {
            imageMessage: viewOnceContent.imageMessage,
          };
        } else {
          normalizedWebMessage.message = { imageMessage: viewOnceContent.imageMessage };
        }
        isImage = true;
      } else if (viewOnceContent.videoMessage) {
        delete viewOnceContent.videoMessage.viewOnce;
        if (quotedMsg) {
          normalizedWebMessage.message.extendedTextMessage.contextInfo.quotedMessage = {
            videoMessage: viewOnceContent.videoMessage,
          };
        } else {
          normalizedWebMessage.message = { videoMessage: viewOnceContent.videoMessage };
        }
        isVideo = true;
      }
    }

    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        `Você precisa marcar ou responder a uma imagem/gif/vídeo!`,
      );
    }

    // Com /fig em um vídeo: transforma o próprio vídeo em sticker animado e
    // incorpora o áudio original, quando houver, na mesma mensagem.
    if (isVideo) {
      const quoted = extractQuotedWAMessage(normalizedWebMessage);
      const videoMessage =
        getMediaType(normalizedWebMessage) === "video"
          ? normalizedWebMessage
          : quoted && getMediaType(quoted) === "video"
            ? quoted
            : null;

      if (!videoMessage) {
        throw new InvalidParameterError(
          `Não consegui localizar o vídeo. Marque o vídeo ou responda a ele com ${PREFIX}fig.`,
        );
      }

      const workdir = createTempWorkdir("fig-video-sound-");
      const videoInput = path.join(workdir, "video_input.mp4");
      const stickerOutput = path.join(workdir, "sticker.webp");
      const audioOutput = path.join(workdir, "audio.ogg");

      try {
        await sendWaitReact();
        await downloadMediaToFile(socket, videoMessage, videoInput);

        const stickerBuffer = await buildWebpSticker(videoInput, stickerOutput, true);
        let audioBuffer = null;
        try {
          audioBuffer = await buildOpusAudio(videoInput, audioOutput, 10);
        } catch {
          // Se o vídeo não tiver faixa de áudio, envia a figurinha animada normal.
        }

        if (audioBuffer?.length) {
          await sendStickerWithAudio(socket, remoteJid, stickerBuffer, audioBuffer);
        } else {
          await socket.sendMessage(remoteJid, { sticker: stickerBuffer });
        }
        await sendSuccessReact();
      } finally {
        cleanupTempWorkdir(workdir);
      }
      return;
    }

    // Fotos continuam usando o comportamento original de criação de figurinha.
    await sendWaitReact();
    await createSticker({
      ...paramsHandler,
      webMessage: normalizedWebMessage,
      isImage,
      isVideo: false,
      stickerMode: ["full", "inteira", "completa"].includes(
        String(paramsHandler.args?.[0] || "").toLowerCase(),
      )
        ? "full"
        : "cropped",
    });
    await sendSuccessReact();
  },
};
