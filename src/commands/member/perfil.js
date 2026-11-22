import { ASSETS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { getProfileImageData } from "../../services/baileys.js";
import { isGroup, onlyNumbers } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "perfil",
  description: "Mostra informações de um usuário",
  commands: ["perfil", "profile"],
  usage: `${PREFIX}perfil ou perfil @usuario`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    socket,
    remoteJid,
    userJid, // Use userJid como fallback se disponível no seu handler
    userLid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
  }) => {
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError(
        "Este comando só pode ser usado em grupo."
      );
    }

    await sendWaitReply("Carregando perfil...");

    try {
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const rawTarget = args[0] ? onlyNumbers(args[0]) : onlyNumbers(userJid || userLid);

      // Procura o participante tanto pelo JID (@s.whatsapp.net) quanto pelo LID (@lid)
      const participant = groupMetadata.participants.find(
        (p) =>
          onlyNumbers(p.id) === rawTarget ||
          (p.lid && onlyNumbers(p.lid) === rawTarget)
      );

      // Prioriza o JID padrão (@s.whatsapp.net) para buscar a foto no Baileys
      const targetJid = participant?.id?.includes("@s.whatsapp.net")
        ? participant.id
        : `${rawTarget}@s.whatsapp.net`;

      const mentionId = participant?.id || targetJid;
      let profilePicUrl;
      let userRole = participant?.admin ? "Administrador" : "Membro";

      try {
        const { profileImage } = await getProfileImageData(socket, targetJid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;
      } catch (error) {
        errorLog(
          `Erro ao tentar pegar foto do usuário ${targetJid}: ${error.message}`
        );
        profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
      }

      const randomPercent = Math.floor(Math.random() * 100);
      const programPrice = (Math.random() * 5000 + 1000).toFixed(2);
      const beautyLevel = Math.floor(Math.random() * 100) + 1;

      const mensagem = `
👤 *Nome:* @${mentionId.split("@")[0]}
📊 *Nível:* ${beautyLevel}

🌚 *Programa:* R$ ${programPrice}
🐮 *Gado:* ${randomPercent + 7 || 5}%
🎱 *Passiva:* ${randomPercent + 5 || 10}%
✨ *Sex Appeal:* ${beautyLevel}%`;

      await sendSuccessReact();

      await socket.sendMessage(remoteJid, {
        image: { url: profilePicUrl },
        caption: mensagem,
        mentions: [mentionId],
      });
    } catch (error) {
      console.error(error);
      sendErrorReply("Ocorreu um erro ao tentar verificar o perfil.");
    }
  },
};
