// src/commands/member/stop.js
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import {
  finishStopGame,
  startStopGame,
  submitStopAnswers,
} from "../../services/stop-game.js";
import { getUserName, isGroup } from "../../utils/index.js";

export default {
  name: "stop",
  description: "Inicia uma partida de Stop/Adedanha com envio de respostas no privado do bot.",
  commands: ["stop", "adedanha", "stop-resp"],
  usage: `${PREFIX}stop`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    fullArgs,
    socket,
    remoteJid,
    userJid,
    userLid,
    webMessage,
    sendReply,
    sendErrorReply,
  }) => {
    const senderJid = userJid || userLid;

    // 1. FLUXO NO PRIVADO: Recebe a lista preenchida e NÃO responde nada no PV
    if (!isGroup(remoteJid)) {
      const text = fullArgs || "";
      const idMatch = text.match(/ID:\s*([A-Z0-9]{4})/i);

      if (!idMatch) {
        return; // Ignora silenciosamente mensagens sem ID válido no PV
      }

      const gameId = idMatch[1].toUpperCase();
      const playerName = getUserName(webMessage, senderJid);

      const sendGroupResult = async (targetGroupId, messageText, mentions) => {
        await socket.sendMessage(targetGroupId, {
          text: messageText,
          mentions,
        });
      };

      // Registra a resposta em silêncio (sem chamar sendReply ou sendReact no PV)
      submitStopAnswers(gameId, senderJid, playerName, text, sendGroupResult);
      return;
    }

    // 2. FLUXO NO GRUPO: Encerrar manualmente com /stop fim
    if (args[0]?.toLowerCase() === "fim") {
      finishStopGame(
        remoteJid,
        async (targetGroupId, messageText, mentions) => {
          await socket.sendMessage(targetGroupId, {
            text: messageText,
            mentions,
          });
        },
        "🛑 Partida encerrada manualmente!"
      );
      return;
    }

    // 3. FLUXO NO GRUPO: Iniciar nova partida
    const sendGroupResult = async (targetGroupId, messageText, mentions) => {
      await socket.sendMessage(targetGroupId, {
        text: messageText,
        mentions,
      });
    };

    const result = startStopGame(remoteJid, sendGroupResult);

    if (result.error) {
      await sendErrorReply(result.error);
      return;
    }

    const { game, categories } = result;

    // Envia instruções no grupo
    await sendReply(
      `🎮 *STOP / ADEDANHA INICIADO!*\n\n` +
        `🔤 *Letra:* *${game.letter}*\n` +
        `👥 *Vagas:* Máximo de *4 jogadores*\n` +
        `⏱️ *Tempo:* 90 segundos (ou encerra assim que 4 pessoas enviarem)\n\n` +
        `📲 *Como jogar:*\n` +
        `1️⃣ Copie a mensagem abaixo.\n` +
        `2️⃣ Cole no *meu privado*, preencha as 7 categorias com a letra *${game.letter}* e envie.\n` +
        `🤫 _Não responderei nada no privado; o resultado sai direto aqui no grupo!_`
    );

    // Envia o template limpo em uma segunda mensagem para facilitar o "Copiar" no celular
    const templateLines = categories.map((c) => `${c.label}: `).join("\n");
    const copyTemplate = `${PREFIX}stop-resp ID: ${game.id}\n${templateLines}`;

    await socket.sendMessage(remoteJid, { text: copyTemplate });
  },
};