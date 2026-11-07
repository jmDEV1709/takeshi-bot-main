const {
    descastigar
} = require('../utils/castigoStore');

function getMentionedIds(message) {
    const content =
        message?.message || {};

    const contextInfo =
        content
            ?.extendedTextMessage
            ?.contextInfo ||
        content
            ?.imageMessage
            ?.contextInfo ||
        content
            ?.videoMessage
            ?.contextInfo ||
        content
            ?.documentMessage
            ?.contextInfo ||
        {};

    const mentioned =
        Array.isArray(
            contextInfo.mentionedJid
        )
            ? contextInfo.mentionedJid
            : [];

    return [
        ...mentioned,
        contextInfo.participant,
        contextInfo.participantAlt
    ].filter(Boolean);
}

module.exports = async ({
    message
}) => {
    const groupId =
        message?.key?.remoteJid;

    const mentionedIds =
        getMentionedIds(message);

    if (!groupId) {
        return '❌ Não consegui identificar o grupo.';
    }

    if (mentionedIds.length === 0) {
        return (
            '❌ Marque uma pessoa.\n\n' +
            'Exemplo:\n' +
            '`,descastigar @pessoa`'
        );
    }

    /*
     * Mesmo que a pessoa não esteja castigada,
     * o comando permanece silencioso.
     */
    descastigar(
        groupId,
        mentionedIds
    );

    return null;
};