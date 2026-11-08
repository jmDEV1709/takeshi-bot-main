import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import fs from "node:fs";
import {
  downloadYouTubeAudio,
  resolveYouTubeUrl,
} from "../../../services/youtube-audio.js";

export default {
  name: "yt-mp3",
  description: "Faço o download de áudios do YouTube pelo link!",
  commands: ["yt-mp3", "youtube-mp3", "yt-audio", "youtube-audio", "mp3"],
  usage: `${PREFIX}yt-mp3 https://www.youtube.com/watch?v=mW8o_WDL91o`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendAudioFromBuffer,
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
      download = await downloadYouTubeAudio(
        await resolveYouTubeUrl(fullArgs),
      );
      await sendAudioFromBuffer(
        await fs.promises.readFile(download.outputPath),
      );
    } catch (error) {
      const messages = {
        SEARCH_NO_RESULTS: "Nenhum resultado encontrado!",
        AUDIO_FORMAT_NOT_FOUND:
          "Não encontrei um formato de áudio compatível para esse vídeo.",
        YOUTUBE_AUTH_REQUIRED:
          "O YouTube bloqueou este download. Renove o cookies.txt ou tente outro vídeo público.",
        YTDLP_NOT_FOUND:
          "O componente de download não está instalado no servidor.",
      };
      await sendErrorReply(
        messages[error.message] ||
          "Não consegui baixar o áudio agora. Tente outro link ou outra música.",
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
