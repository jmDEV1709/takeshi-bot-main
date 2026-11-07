function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getSeed(id, extra) {
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    const str = id + today + extra;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

const sins = [
    { name: 'Luxúria', emoji: '😈' },
    { name: 'Gula', emoji: '🍔' },
    { name: 'Avareza', emoji: '💰' },
    { name: 'Preguiça', emoji: '🦥' },
    { name: 'Ira', emoji: '😡' },
    { name: 'Inveja', emoji: '👀' },
    { name: 'Soberba', emoji: '👑' },
];

module.exports = async ({ message }) => {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const target = mentioned || message.key.participant || message.key.remoteJid;

    let result = `📜 *Pecados Capitais do Dia*\n\n`;

    for (const sin of sins) {
        const percent = Math.floor(seededRandom(getSeed(target, sin.name)) * 101);
        const bar = '▓'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
        result += `${sin.emoji} *${sin.name}*: ${bar} ${percent}%\n`;
    }

    result += `\n_(resultado científico)_`;

    return result;
};