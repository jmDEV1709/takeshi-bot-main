module.exports = async ({ message, sock }) => {
    try {
        const groupId = message.key.remoteJid;

        const participant =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!participant) {
            return "❌ Marca alguém. Ex: ,downadm @usuario";
        }

        await sock.groupParticipantsUpdate(
            groupId,
            [participant],
            "demote"
        );

        return "✅ Administrador removido.";
    } catch (error) {
        console.error(error);
        return "❌ Erro ao remover administrador.";
    }
};
