import { PREFIX } from "../../../config.js";
import { getRandomNumber, onlyNumbers } from "../../../utils/index.js";

const CURVATURE_DIRECTIONS = ["direita", "esquerda", "cima", "baixo"];

export function generatePenisData(randomInt = getRandomNumber) {
  const length = randomInt(1, 35);
  const width = randomInt(1, 12);
  const used = randomInt(0, 69);
  const transou = randomInt(0, used);
  const transouComAMao = used - transou;
  const curvature =
    randomInt(0, 100) < 30
      ? "nenhuma (reto)"
      : CURVATURE_DIRECTIONS[randomInt(0, CURVATURE_DIRECTIONS.length - 1)];

  return {
    length,
    width,
    curvature,
    used,
    transou,
    transouComAMao,
  };
}

export default {
  name: "penis",
  description: "Gera dados aleatórios do pênis",
  commands: ["penis"],
  usage: `${PREFIX}penis ou ${PREFIX}penis @usuario`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, isReply, replyLid, userLid, sendReply }) => {
    const targetLid = isReply
      ? replyLid
      : args[0]
        ? `${onlyNumbers(args[0])}@lid`
        : userLid;

    if (!targetLid) {
      await sendReply("Não foi possível identificar o usuário.");
      return;
    }

    const data = generatePenisData();
    const targetNumber = onlyNumbers(targetLid);

    await sendReply(
      `🍆 *Dados ciêntificos do pênis de @${targetNumber}*

📏 *Comprimento:* ${data.length} cm
📐 *Largura:* ${data.width} cm
↪️ *Curvatura:* ${data.curvature}
🔥 *Usado:* ${data.used} vezes
💑 *Transou:* ${data.transou} vezes
🤚 *Transou com a mão:* ${data.transouComAMao} vezes`,
      [targetLid],
    );
  },
};
