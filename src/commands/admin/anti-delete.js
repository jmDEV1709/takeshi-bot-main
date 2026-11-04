import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { setAntiDeleteStatus, getAntiDeleteStatus } from "../../utils/database.js";
import { isFalse, isTrue } from "../../utils/index.js";

export default {
  name: "anti-delete",
  description: "Revela mensagens apagadas no grupo.",
  commands: ["anti-delete", "antidelete", "anti-del"],
  usage: `${PREFIX}anti-delete (1/0)`,
  handle: async ({ args, isGroup, remoteJid, sendSuccessReply }) => {
    if (!isGroup) {
      throw new WarningError("Este comando só deve ser usado em grupos!");
    }

    if (!args.length) {
      const status = getAntiDeleteStatus(remoteJid) ? "ativado" : "desativado";
      await sendSuccessReply(
        `Anti-delete está ${status}.\nUse ${PREFIX}anti-delete 1 ou 0.`,
      );
      return;
    }

    if (!isTrue(args[0]) && !isFalse(args[0])) {
      throw new InvalidParameterError("Use 1 para ativar ou 0 para desativar!");
    }

    const enabled = isTrue(args[0]);
    setAntiDeleteStatus(remoteJid, enabled);
    await sendSuccessReply(`Anti-delete ${enabled ? "ativado" : "desativado"} com sucesso!`);
  },
};
