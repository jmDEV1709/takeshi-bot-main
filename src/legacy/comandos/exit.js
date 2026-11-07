const { games } = require('../utils/navalStore');

module.exports = async ({ message }) => {
    const groupId = message?.key?.remoteJid;

    if (!groupId) {
        return '❌ Esse comando só funciona em grupo.';
    }

    const game = games.get(groupId);

    if (!game || game.status !== 'playing') {
        return '❌ Não tem nenhuma Batalha Naval ativa pra encerrar.';
    }

    games.delete(groupId);

    return '🛑 Batalha Naval encerrada.';
};