import { PREFIX } from "../../../config.js";
import { WarningError } from "../../../errors/index.js";
import { getRandomNumber, onlyNumbers } from "../../../utils/index.js";
import {
  formatRankCooldown,
  getRankCooldownRemaining,
  getRankingParticipants,
  shuffleAndPick,
  startRankCooldown,
} from "../../../utils/ranking.js";

export default {
  name: "rankbunda",
  description: "Ranking engraçado e aleatório das bundas do grupo",
  commands: ["rankbunda", "bunda"],
  usage: `${PREFIX}rankbunda`,
  handle: async ({
    remoteJid,
    isGroup,
    getGroupParticipants,
    sendReply,
  }) => {
    if (!isGroup) {
      throw new WarningError("Este ranking só pode ser usado em grupos.");
    }

    const remaining = getRankCooldownRemaining(remoteJid);
    if (remaining > 0) {
      throw new WarningError(
        `Aguarde ${formatRankCooldown(remaining)} para usar os rankings novamente.`,
      );
    }

    const participants = getRankingParticipants(
      await getGroupParticipants(),
      40,
    );
    if (participants.length < 4) {
      throw new WarningError("O grupo precisa ter pelo menos 4 participantes.");
    }

    const ranked = shuffleAndPick(participants, 4).map((jid) => ({
      jid,
      size: getRandomNumber(80, 150),
    }));

    ranked.sort((a, b) => b.size - a.size);

    const text =
      "🍑 *RANKING DAS BUNDAS*\n\n" +
      ranked
        .map(
          (item, index) =>
            `${index + 1}º - @${onlyNumbers(item.jid)} — ${item.size} cm`,
        )
        .join("\n") +
      "\n\n⚠️ Resultado totalmente ciêntifico.";

    startRankCooldown(remoteJid);
    await sendReply(text, ranked.map((item) => item.jid));
  },
};
