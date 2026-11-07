const {
    games,
    generateBoard
} = require('../utils/navalStore');

function getMentionedId(message) {
    const contextInfo =
        message?.message?.extendedTextMessage?.contextInfo || {};

    const mentioned =
        Array.isArray(contextInfo.mentionedJid)
            ? contextInfo.mentionedJid
            : [];

    return mentioned[0] || null;
}

module.exports = async ({ message }) => {
    const groupId = message?.key?.remoteJid;
    const sender = message?.key?.participant || message?.key?.remoteJid;

    if (!groupId) {
        return '❌ Esse comando só funciona em grupo.';
    }

    const existing = games.get(groupId);

    if (existing && existing.status === 'playing') {
        return (
            '⚠️ Já tem uma Batalha Naval rolando neste grupo.\n' +
            'Use `,exit` pra encerrar antes de começar outra.'
        );
    }

    const opponent = getMentionedId(message);

    if (opponent) {
        if (opponent === sender) {
            return '❌ Você não pode desafiar a si mesmo.';
        }

        games.set(groupId, {
            mode: 'pvp',
            status: 'playing',
            players: [sender, opponent],
            boards: {
                [sender]: generateBoard(),
                [opponent]: generateBoard()
            },
            turn: sender,
            createdBy: sender
        });

        return (
            '🚢 *Batalha Naval iniciada!* (1x1)\n\n' +
            `@${sender.split('@')[0]} vs @${opponent.split('@')[0]}\n\n` +
            'Tabuleiro 16x16, frota sorteada pra cada jogador.\n' +
            `Vez de: @${sender.split('@')[0]}\n\n` +
            'Atire com `,shoot <coluna><linha>`, ex: `,shoot a2`\n' +
            'Encerrar a qualquer momento com `,exit`'
        );
    }

    games.set(groupId, {
        mode: 'solo',
        status: 'playing',
        players: [sender],
        boards: {
            [sender]: generateBoard()
        },
        turn: sender,
        createdBy: sender
    });

    return (
        '🚢 *Batalha Naval iniciada!* (Solo)\n\n' +
        'Tabuleiro 16x16, frota sorteada aleatoriamente.\n\n' +
        'Atire com `,shoot <coluna><linha>`, ex: `,shoot a2`\n' +
        'Encerrar a qualquer momento com `,exit`'
    );
};