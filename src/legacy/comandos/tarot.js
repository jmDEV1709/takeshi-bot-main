const fs = require('fs');
const path = require('path');

const NOMES_MAIORES = [
    'fool', 'magician', 'priestess', 'empress', 'emperor', 'hierophant',
    'lovers', 'chariot', 'strength', 'hermit', 'fortune', 'justice',
    'hanged', 'death', 'temperance', 'devil', 'tower', 'star',
    'moon', 'sun', 'judgement', 'world'
];

const NOMES_CORTE = {
    11: 'page',
    12: 'knight',
    13: 'queen',
    14: 'king'
};

const cartasPt = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'database', 'tarot-pt.json'), 'utf8')
);

function caminhoImagem(carta) {
    let arquivo;

    if (carta.type === 'major') {
        arquivo = `major_arcana_${NOMES_MAIORES[carta.value_int]}.png`;
    } else {
        const rank = NOMES_CORTE[carta.value_int] || (carta.value_int === 1 ? 'ace' : String(carta.value_int));
        arquivo = `minor_arcana_${carta.suit}_${rank}.png`;
    }

    return path.join(__dirname, '..', 'media', 'tarot', arquivo);
}

async function puxarCartas(quantidade) {
    const response = await fetch(`https://tarotapi.dev/api/v1/cards/random?n=${quantidade}`);

    if (!response.ok) {
        throw new Error(`API respondeu ${response.status}`);
    }

    const data = await response.json();
    return data.cards;
}

function sortearOrientacao() {
    return Math.random() < 0.5 ? 'normal' : 'invertida';
}

module.exports = async ({ args, message, sock }) => {
    const remoteJid = message.key.remoteJid;

    try {
        let quantidade = parseInt(args[0], 10);

        if (!Number.isFinite(quantidade) || quantidade < 1) quantidade = 1;
        if (quantidade > 5) quantidade = 5;

        const cartas = await puxarCartas(quantidade);

        const posicoes = ['Passado', 'Presente', 'Futuro', 'Conselho', 'Resultado'];

        for (let i = 0; i < cartas.length; i++) {
            const carta = cartas[i];
            const imgPath = caminhoImagem(carta);

            const orientacao = sortearOrientacao();
            const estaInvertida = orientacao === 'invertida';

            const label = quantidade > 1 ? `${posicoes[i] || `Carta ${i + 1}`}: ` : '';

            const pt = cartasPt[carta.name_short] || {
                name: carta.name,
                meaning_up: carta.meaning_up,
                meaning_rev: carta.meaning_rev
            };

            const simboloOrientacao = estaInvertida ? '🔄' : '✅';
            const textoOrientacao = estaInvertida ? 'Invertida' : 'Normal';
            const significado = estaInvertida ? pt.meaning_rev : pt.meaning_up;

            let legenda = `🔮 *${label}${pt.name}*\n`;
            legenda += `${simboloOrientacao} *Posição:* ${textoOrientacao}\n\n`;
            legenda += `🃏 *Interpretação:*\n${significado}`;

            if (fs.existsSync(imgPath)) {
                await sock.sendMessage(remoteJid, {
                    image: fs.readFileSync(imgPath),
                    caption: legenda
                }, { quoted: message });
            } else {
                await sock.sendMessage(remoteJid, {
                    text: legenda
                }, { quoted: message });
            }
        }

        return null;
    } catch (error) {
        console.error('Erro ao consultar tarot API:', error);
        return '❌ Não consegui puxar as cartas agora. Tenta de novo em instantes.';
    }
};