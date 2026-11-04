import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import fs from "node:fs";
import {
  downloadYouTubeAudio,
  resolveYouTubeUrl,
} from "../../../services/youtube-audio.js";

export default {
  name: "play-audio",
  description: "Faço o download de músicas",
  commands: ["play-audio", "play", "pa"],
  usage: `${PREFIX}play-audio MC Hariel`,
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
        "Você precisa me dizer o que deseja buscar!",
      );
    }

    await sendWaitReact();

    let outputPath;

    try {
      const youtubeUrl = await resolveYouTubeUrl(fullArgs);
      const download = await downloadYouTubeAudio(youtubeUrl);
      outputPath = download.outputPath;

      await sendAudioFromBuffer(await fs.promises.readFile(outputPath));
    } catch (error) {
      if (error.message === "SEARCH_NO_RESULTS") {
        await sendErrorReply("Não encontrei resultados para essa busca no YouTube.");
      } else if (error.message === "FILE_TOO_LARGE") {
        await sendErrorReply("O áudio ultrapassa o limite de 25 MB do bot.");
      } else if (error.message === "AUDIO_FORMAT_NOT_FOUND") {
        await sendErrorReply("Não encontrei um formato de áudio compatível para esse vídeo.");
      } else if (error.message === "YOUTUBE_AUTH_REQUIRED") {
        await sendErrorReply(
          "O YouTube bloqueou este download por exigir verificação ou login. Tente outro vídeo público.",
        );
      } else {
        console.error("Erro no comando play:", error);
        await sendErrorReply("Não consegui baixar o áudio agora. Tente outro link ou outra música.");
      }
    } finally {
      if (outputPath) {
        await fs.promises.unlink(outputPath).catch(() => {});
      }
    }
  },
};
