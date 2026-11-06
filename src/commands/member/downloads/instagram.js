import { PREFIX } from "../../../config.js";
import { InvalidParameterError, WarningError } from "../../../errors/index.js";
import {
  downloadSocialVideo,
  socialDownloadError,
} from "../../../services/social-downloader.js";

export default {
  name: "instagram",
  description: "Faço o download de vídeos/reels do Instagram",
  commands: ["instagram", "ig", "inst", "insta"],
  usage: `${PREFIX}instagram https://www.instagram.com/reel/Cx789012345/`,
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
        "Você precisa enviar uma URL do Instagram!"
      );
    }

    await sendWaitReact();

    try {
      if (!url.includes("instagram.com")) {
        throw new WarningError("O link não é do Instagram!");
      }
      const video = await downloadSocialVideo(url, "instagram");
      await sendSuccessReact();
      await sendVideoFromBuffer(video, "Vídeo baixado do Instagram");
    } catch (error) {
      await sendErrorReply(socialDownloadError(error, "Instagram"));
    }
  },
};
