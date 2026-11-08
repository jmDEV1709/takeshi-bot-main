import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import fs from "node:fs";
import {
  downloadYouTubeVideo,
  resolveYouTubeUrl,
} from "../../../services/youtube-audio.js";

export default {
  name: "yt-mp4",
  description: "Faço o download de áudios do YouTube pelo link!",
  commands: ["yt-mp4", "youtube-mp4", "yt-video", "youtube-video", "mp4"],
  usage: `${PREFIX}yt-mp4 https://www.youtube.com/watch?v=mW8o_WDL91o`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendVideoFromBuffer,
    fullArgs,
    sendWaitReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa enviar uma URL do YouTube!"
      );
    }

    await sendWaitReact();

    let download;

    try {
      download = await downloadYouTubeVideo(
        await resolveYouTubeUrl(fullArgs),
      );
      await sendVideoFromBuffer(
        await fs.promises.readFile(download.outputPath),
      );
    } catch (error) {
      const messages = {
        SEARCH_NO_RESULTS: "Nenhum resultado encontrado!",
        VIDEO_FORMAT_NOT_FOUND:
          "Não encontrei um formato de vídeo compatível para esse vídeo.",
        YOUTUBE_AUTH_REQUIRED:
          "O YouTube bloqueou este download. Renove o cookies.txt ou tente outro vídeo público.",
        YTDLP_NOT_FOUND:
          "O componente de download não está instalado no servidor.",
      };
      await sendErrorReply(
        messages[error.message] ||
          "Não consegui baixar o vídeo agora. Tente outro link ou outro vídeo.",
      );
    } finally {
      if (download?.outputDir) {
        await fs.promises.rm(download.outputDir, {
          recursive: true,
          force: true,
        });
      }
    }
  },
};
