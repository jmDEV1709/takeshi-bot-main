// src/commands/member/stop.js
import { PREFIX } from "../../config.js";
import {
  finishStopGame,
  startStopGame,
  submitStopAnswers,
} from "../../services/stop-game.js";
import { getUserName, isGroup } from "../../utils/index.js";

function extractRawText(webMessage) {
  return (
    webMessage?.message?.conversation ||
    webMessage?.message?.extendedTextMessage?.text ||
    ""
  );
}

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

    // 1. FLUXO NO PRIVADO: Lê o texto bruto completo (preservando todas as quebras de linha)
    if (!isGroup(remoteJid)) {
      const rawText = extractRawText(webMessage) || fullArgs || "";
      const idMatch = rawText.match(/ID:\s*#?([A-Z0-9]{4})/i);

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

      // Registra em silêncio (sem responder nem reagir no PV)
      submitStopAnswers(gameId, senderJid, playerName, rawText, sendGroupResult);
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

    // Mensagem 1: Regras e letra sorteada
    await sendReply(
      `🎮 *STOP / ADEDANHA INICIADO!*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🔤 *Letra:* *${game.letter}*\n` +
        `👥 *Vagas:* Máximo de *4 jogadores*\n` +
        `⏱️ *Tempo:* *90 segundos*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📲 *Como jogar:*\n` +
        `1️⃣ Copie a ficha logo abaixo.\n` +
        `2️⃣ Cole no *meu privado*, preencha as 7 categorias com a letra *${game.letter}* e envie.\n` +
        `🤫 _Não responderei nada no privado; o placar sai direto aqui no grupo!_`
    );

    // Mensagem 2: Ficha espaçada e formatada para facilitar o toque e preenchimento no celular
    const templateLines = categories
      .map((c) => `${c.emoji} *${c.label}:* `)
      .join("\n\n");

    const copyTemplate =
      `${PREFIX}stop-resp\n` +
      `🆔 *ID:* #${game.id}\n` +
      `🔤 *Letra:* ${game.letter}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${templateLines}`;

    await socket.sendMessage(remoteJid, { text: copyTemplate });
  },
};