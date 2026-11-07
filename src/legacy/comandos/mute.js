const { muteUser } = require('../utils/mutedStore');

module.exports = async ({ message, sock }) => {
    try {
        const groupId = message.key.remoteJid;

        if (!groupId.endsWith('@g.us')) {
            return '❌ Esse comando só funciona em grupos.';
        }

        const contextInfo =
            message.message?.extendedTextMessage?.contextInfo ||
            message.message?.imageMessage?.contextInfo ||
            message.message?.videoMessage?.contextInfo ||
            message.message?.conversation?.contextInfo;

        const mentioned = contextInfo?.mentionedJid?.[0];
        const quotedParticipant = contextInfo?.participant;

        const participant = mentioned || quotedParticipant;

        if (!participant) {
            return '❌ Marca a pessoa ou responde uma mensagem dela. Exemplo: ,mute @usuario';
        }

        muteUser(groupId, participant);

        return `🔇 Usuário mutado. As mensagens dele serão apagadas automaticamente.`;
    } catch (error) {
        console.error('Erro no comando mute:', error);
        return '❌ Erro ao mutar usuário.';
    }
};