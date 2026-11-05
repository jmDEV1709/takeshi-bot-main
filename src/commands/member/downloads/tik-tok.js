import { PREFIX } from "../../../config.js";
import { InvalidParameterError, WarningError } from "../../../errors/index.js";
import {
  downloadSocialVideo,
  socialDownloadError,
} from "../../../services/social-downloader.js";

export default {
  name: "tik-tok",
  description: "Faço o download de vídeos do TikTok",
  commands: ["tik-tok", "ttk", "tik", "tk"],
  usage: `${PREFIX}tik-tok https://www.tiktok.com/@yrrefutavel/video/7359413022483287301`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendVideoFromBuffer,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    const url = fullArgs.trim();

    if (!url) {
      throw new InvalidParameterError("Você precisa enviar uma URL do TikTok!");
    }

    await sendWaitReact();

    try {
      if (!url.includes("tiktok")) {
        throw new WarningError("O link não é do TikTok!");
      }
      const video = await downloadSocialVideo(url, "tiktok");
      await sendSuccessReact();
      await sendVideoFromBuffer(video, "Vídeo baixado do TikTok");
    } catch (error) {
      await sendErrorReply(socialDownloadError(error, "TikTok"));
    }
  },
};
