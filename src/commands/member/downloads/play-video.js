import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import fs from "node:fs";
import {
  downloadYouTubeVideo,
  resolveYouTubeUrl,
} from "../../../services/youtube-audio.js";

export default {
  name: "play-video",
  description: "Faço o download de vídeos",
  commands: ["play-video", "pv"],
  usage: `${PREFIX}play-video MC Hariel`,
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
        "Você precisa me dizer o que deseja buscar!",
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
