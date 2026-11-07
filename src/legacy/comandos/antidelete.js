const { setAntidelete, isAntideleteOn } = require('../utils/antideleteStore');

module.exports = async ({ args, message, isAdmin }) => {
    if (!isAdmin) {
        return '❌ Apenas administradores podem usar este comando.';
    }

    const groupId = message.key.remoteJid;
    const opcao = (args[0] || '').toLowerCase();

    if (opcao === 'on' || opcao === 'ligar') {
        setAntidelete(groupId, true);
        return '🕵️ *Anti-delete ATIVADO!*\nAgora vou revelar mensagens apagadas neste grupo.';
    }

    if (opcao === 'off' || opcao === 'desligar') {
        setAntidelete(groupId, false);
        return '✅ *Anti-delete DESATIVADO.*\nMensagens apagadas não serão mais reveladas.';
    }

    const status = isAntideleteOn(groupId) ? 'LIGADO 🟢' : 'DESLIGADO 🔴';
    return `🕵️ *Anti-delete*\n\nStatus atual: *${status}*\n\nUse:\n,antidelete on\n,antidelete off`;
};