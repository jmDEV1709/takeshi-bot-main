const { unmuteUser } = require('../utils/mutedStore');

module.exports = async ({ message, sock }) => {
    try {
        const groupId = message.key.remoteJid;

        const participant =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!participant) {
            return "❌ Marca a pessoa. Exemplo: ,unmute @usuario";
        }

        unmuteUser(groupId, participant);

        return "🔊 Utilizador desmutado.";
    } catch (error) {
        console.error(error);
        return "❌ Erro ao desmutar utilizador.";
    }
};