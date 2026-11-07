const { salvarJogada } = require('../utils/blackjackStore');

const naipes = ['♠', '♥', '♦', '♣'];
const valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function criarBaralho() {
    const baralho = [];

    for (const naipe of naipes) {
        for (const valor of valores) {
            baralho.push({
                valor,
                naipe
            });
        }
    }

    return baralho.sort(() => Math.random() - 0.5);
}

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

    const baralho = criarBaralho();

    const jogadorCartas = [
        baralho.pop(),
        baralho.pop()
    ];

    const dealerCartas = [
        baralho.pop(),
        baralho.pop()
    ];

    salvarJogada(jogador, {
        baralho,
        jogadorCartas,
        dealerCartas
    });

    return `╭━━━━━━━━━━━━━━━╮
┃ 🃏 BLACKJACK
╰━━━━━━━━━━━━━━━╯

🤖 Dealer:
${dealerCartas[0].valor}${dealerCartas[0].naipe} ❓

👤 Você:
${formatar(jogadorCartas)}

📊 Total: ${valorMao(jogadorCartas)}

━━━━━━━━━━━━━━━

🟢 ,hit → comprar carta
🔴 ,stand → parar`;
};
``