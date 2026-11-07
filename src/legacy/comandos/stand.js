const {
    pegarJogada,
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
        return '❌ Use ,blackjack primeiro.';
    }

    while (valorMao(jogo.dealerCartas) < 17) {
        jogo.dealerCartas.push(jogo.baralho.pop());
    }

    const pJogador = valorMao(jogo.jogadorCartas);
    const pDealer = valorMao(jogo.dealerCartas);

    removerJogada(jogador);

    let resultado;

    if (pDealer > 21) {
        resultado = '🎉 Você venceu!';
    } else if (pJogador > pDealer) {
        resultado = '🎉 Você venceu!';
    } else if (pDealer > pJogador) {
        resultado = '😢 Dealer venceu!';
    } else {
        resultado = '🤝 Empate!';
    }

    return `╭━━━━━━━━━━━━━━━╮
┃ 🃏 RESULTADO
╰━━━━━━━━━━━━━━━╯

🤖 Dealer:
${formatar(jogo.dealerCartas)}

📊 ${pDealer}

👤 Você:
${formatar(jogo.jogadorCartas)}

📊 ${pJogador}

━━━━━━━━━━━━━━━

${resultado}`;
};