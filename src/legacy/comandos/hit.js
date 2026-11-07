const {
    pegarJogada,
    salvarJogada,
    removerJogada
} = require('../utils/blackjackStore');

function valorMao(cartas) {
    let total = 0;
    let ases = 0;

    for (const carta of cartas) {
        if (['J', 'Q', 'K'].includes(carta.valor)) {
            total += 10;
        } else if (carta.valor === 'A') {
            total += 11;
            ases++;
        } else {
            total += parseInt(carta.valor);
        }
    }

    while (total > 21 && ases > 0) {
        total -= 10;
        ases--;
    }

    return total;
}

function formatar(cartas) {
    return cartas.map(c => `${c.valor}${c.naipe}`).join(' ');
}

module.exports = async ({ message }) => {
    const jogador = message.key.participant || message.key.remoteJid;

    const jogo = pegarJogada(jogador);

    if (!jogo) {
        return '❌ Use ,blackjack para iniciar.';
    }

    jogo.jogadorCartas.push(jogo.baralho.pop());

    const pontos = valorMao(jogo.jogadorCartas);

    if (pontos > 21) {
        removerJogada(jogador);

        return `💥 ESTOUROU!

${formatar(jogo.jogadorCartas)}

📊 Total: ${pontos}

❌ Você perdeu.`;
    }

    salvarJogada(jogador, jogo);

    return `🃏 Sua mão:

${formatar(jogo.jogadorCartas)}

📊 Total: ${pontos}

🟢 ,hit
🔴 ,stand`;
};