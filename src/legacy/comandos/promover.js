module.exports = async ({ message, sock }) => {
    try {
        const groupId = message.key.remoteJid;

        const participant =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!participant) {
            return "❌ Marca alguém. Ex: ,upadm @usuario";
        }

        await sock.groupParticipantsUpdate(
            groupId,
            [participant],
            "promote"
        );

        return "✅ Utilizador promovido a administrador.";
    } catch (error) {
        console.error(error);
        return "❌ Erro ao promover.";
    }
};