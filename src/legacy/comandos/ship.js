function gerarPorcentagem(id1, id2) {
    const base = `${id1}-${id2}`;
    let hash = 0;

    for (let i = 0; i < base.length; i++) {
        hash = ((hash << 5) - hash) + base.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash) % 101;
}

function barraCompatibilidade(porcentagem) {
    const total = 10;
    const preenchido = Math.round((porcentagem / 100) * total);
    const vazio = total - preenchido;

    return '█'.repeat(preenchido) + '░'.repeat(vazio);
}

function fraseCompatibilidade(porcentagem) {
    if (porcentagem <= 10) return '😬 Melhor deixar só na amizade mesmo.';
    if (porcentagem <= 25) return '🤔 Compatibilidade baixa, mas vai que surpreende.';
    if (porcentagem <= 40) return '🙂 Tem potencial, mas precisa conversar mais.';
    if (porcentagem <= 60) return '😄 Combinação equilibrada.';
    if (porcentagem <= 75) return '💞 Combinação boa, hein!';
    if (porcentagem <= 90) return '❤️ Compatibilidade muito forte!';
    return '💍 Isso aqui tá nível novela das nove!';
}

function pegarNome(jid) {
    return `@${jid.split('@')[0]}`;
}

module.exports = async ({ sock, message }) => {
    const remoteJid = message.key.remoteJid;

    const mentions =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (mentions.length < 2) {
        return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃     ❤️ *COMPATIBILIDADE*
╰━━━━━━━━━━━━━━━━━━━━━━╯

Marque duas pessoas para calcular a compatibilidade.

📌 *Exemplo:*
,ship @pessoa1 @pessoa2

ou

,compatibilidade @pessoa1 @pessoa2`;
    }

    const pessoa1 = mentions[0];
    const pessoa2 = mentions[1];

    if (pessoa1 === pessoa2) {
        return '😅 Marque duas pessoas diferentes.';
    }

    const porcentagem = gerarPorcentagem(pessoa1, pessoa2);
    const barra = barraCompatibilidade(porcentagem);
    const frase = fraseCompatibilidade(porcentagem);

    const nome1 = pegarNome(pessoa1);
    const nome2 = pegarNome(pessoa2);

    const msg = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃     ❤️ *COMPATIBILIDADE*
╰━━━━━━━━━━━━━━━━━━━━━━╯

${nome1} + ${nome2}

📊 *Resultado:* ${porcentagem}%

\`${barra}\`

${frase}

━━━━━━━━━━━━━━━━━━━━━━
🎲 Resultado gerado apenas por brincadeira.`;

    await sock.sendMessage(
        remoteJid,
        {
            text: msg,
            mentions: [pessoa1, pessoa2]
        },
        { quoted: message }
    );

    return null;
};