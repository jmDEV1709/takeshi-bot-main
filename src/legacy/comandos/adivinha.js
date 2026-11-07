const games = {}; // { groupId: numeroSecreto }

module.exports = async ({ message, args }) => {
    const groupId = message.key.remoteJid;

    if (args[0] === 'sair') {
        if (games[groupId]) {
            delete games[groupId];
            return "🚪 Jogo encerrado.";
        }
        return "❌ Não há jogo em andamento.";
    }

    if (!games[groupId]) {
        games[groupId] = Math.floor(Math.random() * 100) + 1;
        return "🎲 Escolhi um número entre 1 e 100! Digite ,adivinha <numero> pra tentar. (,adivinha sair pra cancelar)";
    }

    const tentativa = parseInt(args[0], 10);

    if (isNaN(tentativa)) {
        return "❌ Digite um número. Exemplo: ,adivinha 42";
    }

    if (tentativa === games[groupId]) {
        delete games[groupId];
        return "🎉 Acertou! Parabéns!";
    }

    if (tentativa < games[groupId]) {
        return "📈 Mais alto!";
    } else {
        return "📉 Mais baixo!";
    }
};