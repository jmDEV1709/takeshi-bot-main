const { isProtectedUser } = require('../utils/protectedUsers');

module.exports = async ({ message, sock }) => {
    try {
        const groupId = message.key.remoteJid;

        const participant =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!participant) {
            return '❌ Marca a pessoa. Exemplo: ,ban @usuario';
        }

        if (isProtectedUser(participant)) {
            return '🛡️ Esse usuário é protegido e não pode ser banido.';
        }

        await sock.groupParticipantsUpdate(
            groupId,
            [participant],
            'remove'
        );

        return '✅ Usuário removido do grupo.';
    } catch (error) {
        console.error(error);
        return '❌ Erro ao remover usuário.';
    }
};