function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getSeed(id) {
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    const str = id + today;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

module.exports = async ({ message }) => {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const target = mentioned || message.key.participant || message.key.remoteJid;

    const percent = Math.floor(seededRandom(getSeed(target)) * 101);

    const bar = '▓'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));

    return `🏳️‍🌈 *Teste do dia*\n\n${bar} ${percent}%\n\n_(resultado científico)_`;
};