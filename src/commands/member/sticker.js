import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { createSticker } from "../../services/sticker.js";

export default {
  name: "sticker",
  description: "Cria figurinhas de imagem, gif ou vídeo (máximo 10 segundos).",
  commands: ["f", "s", "sticker", "fig"],
  usage: `${PREFIX}sticker (marque ou responda uma imagem/gif/vídeo)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async (paramsHandler) => {
    const { webMessage, sendWaitReact, sendSuccessReact } = paramsHandler;
    let { isImage, isVideo } = paramsHandler;

    // Clona a mensagem para não alterar a referência original
    const normalizedWebMessage = JSON.parse(JSON.stringify(webMessage));
    const quotedMsg =
      normalizedWebMessage?.message?.extendedTextMessage?.contextInfo
        ?.quotedMessage;
    const targetMsg = quotedMsg || normalizedWebMessage?.message;

    // Detecta visualização única (V1, V2 ou V2Extension)
    const viewOnceContent =
      targetMsg?.viewOnceMessage?.message ||
      targetMsg?.viewOnceMessageV2?.message ||
      targetMsg?.viewOnceMessageV2Extension?.message;

    if (viewOnceContent) {
      // Remove a flag de visualização única e traz a mídia para o nível esperado pelo downloader
      if (viewOnceContent.imageMessage) {
        delete viewOnceContent.imageMessage.viewOnce;
        if (quotedMsg) {
          normalizedWebMessage.message.extendedTextMessage.contextInfo.quotedMessage =
            { imageMessage: viewOnceContent.imageMessage };
        } else {
          normalizedWebMessage.message = {
            imageMessage: viewOnceContent.imageMessage,
          };
        }
        isImage = true;
      } else if (viewOnceContent.videoMessage) {
        delete viewOnceContent.videoMessage.viewOnce;
        if (quotedMsg) {
          normalizedWebMessage.message.extendedTextMessage.contextInfo.quotedMessage =
            { videoMessage: viewOnceContent.videoMessage };
        } else {
          normalizedWebMessage.message = {
            videoMessage: viewOnceContent.videoMessage,
          };
        }
        isVideo = true;
      }
    }

    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        `Você precisa marcar ou responder a uma imagem/gif/vídeo!`
      );
    }

    await sendWaitReact();
    await createSticker({
      ...paramsHandler,
      webMessage: normalizedWebMessage,
      isImage,
      isVideo,
      stickerMode: ["full", "inteira", "completa"].includes(
        String(paramsHandler.args?.[0] || "").toLowerCase()
      )
        ? "full"
        : "cropped",
    });
    await sendSuccessReact();
  },
};