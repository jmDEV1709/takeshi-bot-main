const {
    entrarNoCampeonato,
    montarChaveamento,
    mencoesDoCampeonato
} = require('../utils/campStore');

module.exports = async ({ message, sock }) => {
    const groupId = message.key.remoteJid;
    const jogadorId =
        message.key.participantAlt ||
        message.key.participant ||
        message.participant;

    if (!jogadorId) return '❌ Não consegui identificar seu usuário.';

    try {
        const camp = entrarNoCampeonato(groupId, {
            id: jogadorId,
            nome: message.pushName || ''
        });

        const lotou = camp.participantes.length === camp.limite;
        const cabecalho = lotou
            ? '🔒 *16/16! INSCRIÇÕES ENCERRADAS E OITAVAS DEFINIDAS!*'
            : `✅ *${message.pushName || 'Jogador'} entrou no campeonato!*`;

        await sock.sendMessage(
            groupId,
            {
                text: `${cabecalho}\n\n${montarChaveamento(camp)}`,
                mentions: mencoesDoCampeonato(camp)
            },
            { quoted: message }
        );
        return null;
    } catch (error) {
        return `❌ ${error.message}`;
    }
};
