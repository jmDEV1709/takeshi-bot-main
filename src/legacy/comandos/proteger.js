const { isProtectedUser, addProtectedUser } = require('../utils/protectedUsers');

function getMentionedIds(message) {
    const contextInfo =
        message?.message?.extendedTextMessage?.contextInfo || {};

    const mentioned =
        Array.isArray(contextInfo.mentionedJid)
            ? contextInfo.mentionedJid
            : [];

    return [
        ...mentioned,
        contextInfo.participant,
        contextInfo.participantAlt
    ].filter(Boolean);
}

module.exports = async ({ message }) => {
    const remetente =
        message?.key?.participant ||
        message?.key?.remoteJid;

    if (!isProtectedUser(remetente)) {
        return '❌ Apenas um usuário protegido pode conceder proteção.';
    }

    const mentionedIds = getMentionedIds(message);

    if (mentionedIds.length === 0) {
        return (
            '❌ Marque uma pessoa.\n\n' +
            'Exemplo:\n' +
            '`,proteger @pessoa`'
        );
    }

    const alvo = mentionedIds[0];
    const result = addProtectedUser(alvo);

    if (!result.success) {
        if (result.reason === 'already') {
            return '🛡️ Esse número já está protegido.';
        }
        return '❌ Não consegui identificar o número da pessoa marcada.';
    }

    return `🛡️ Número protegido com sucesso: ${result.number}`;
};