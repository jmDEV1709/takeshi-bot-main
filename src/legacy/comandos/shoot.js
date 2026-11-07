const {
    games,
    parseCoordinate,
    fireShot,
    allSunk,
    renderBoard
} = require('../utils/navalStore');

module.exports = async ({ args, message }) => {
    const groupId = message?.key?.remoteJid;
    const sender = message?.key?.participant || message?.key?.remoteJid;

    if (!groupId) {
        return '❌ Esse comando só funciona em grupo.';
    }

    const game = games.get(groupId);

    if (!game || game.status !== 'playing') {
        return '❌ Não tem Batalha Naval rolando. Use `,naval` pra começar.';
    }

    if (!game.players.includes(sender)) {
        return '❌ Você não faz parte dessa partida.';
    }

    const coord = parseCoordinate(args?.[0]);

    if (!coord) {
        return (
            '❌ Coordenada inválida.\n' +
            'Use letra (a-h) + número (1-8)\n' +
            'Ex: ,shoot a2'
        );
    }

    // SOLO
    if (game.mode === 'solo') {
        const board = game.boards[sender];

        const result = fireShot(
            board,
            coord.row,
            coord.col
        );

        if (result.alreadyShot) {
            return `⚠️ Você já atirou em ${coord.label}.`;
        }

        let resposta = result.hit
            ? `💥 ACERTOU EM ${coord.label}!`
            : `🌊 ÁGUA EM ${coord.label}!`;

        if (result.hit && result.sunk) {
            resposta += `\n🚢 Você afundou o ${result.ship.name}!`;
        }

        resposta += '\n\n' + renderBoard(board);

        if (allSunk(board)) {
            games.delete(groupId);

            resposta +=
                '\n\n🏆 VOCÊ VENCEU!\n' +
                'Toda a frota foi destruída.';
        }

        return resposta;
    }

    // PVP

    if (game.turn !== sender) {
        return '⏳ Não é sua vez.';
    }

    const opponent =
        game.players.find(p => p !== sender);

    const board =
        game.boards[opponent];

    const result = fireShot(
        board,
        coord.row,
        coord.col
    );

    if (result.alreadyShot) {
        return `⚠️ Você já atirou em ${coord.label}.`;
    }

    let resposta = result.hit
        ? `💥 @${sender.split('@')[0]} acertou ${coord.label}!`
        : `🌊 @${sender.split('@')[0]} atirou em ${coord.label} e errou!`;

    if (result.hit && result.sunk) {
        resposta +=
            `\n🚢 Afundou o ${result.ship.name}!`;
    }

    resposta += '\n\n';
    resposta += renderBoard(board);

    if (allSunk(board)) {
        games.delete(groupId);

        resposta +=
            `\n\n🏆 @${sender.split('@')[0]} venceu a partida!`;

        return resposta;
    }

    game.turn = opponent;

    resposta +=
        `\n\n🎮 Próxima vez: @${opponent.split('@')[0]}`;
    resposta += '\n\nUse ,shoot <letra><número> para atirar.';
    return resposta;
};