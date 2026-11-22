import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import {
  downloadSocialVideo,
  socialDownloadError,
} from "../../../services/social-downloader.js";

export default {
  name: "x-twitter",
  description: "Faço o download de vídeos ou imagens do X (Twitter)",
  commands: ["xtwitter", "twitter", "x"],
  usage: `${PREFIX}xtwitter https://x.com/usuario/status/1234567890`,
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
      throw new InvalidParameterError(
        "Você precisa enviar uma URL do X (Twitter)!",
      );
    }

    await sendWaitReact();

    try {
      const video = await downloadSocialVideo(url, "x");
      await sendSuccessReact();
      await sendVideoFromBuffer(video, "Vídeo baixado do X");
    } catch (error) {
      await sendErrorReply(socialDownloadError(error, "X/Twitter"));
    }
  },
};