const {
    brasilApi,
    formatarDataBR
} = require('../utils/brasilApi');

module.exports = async ({ args }) => {
    try {
        const ano = args[0] || new Date().getFullYear();

        if (!/^\d{4}$/.test(String(ano))) {
            return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃       📅 *FERIADOS*
╰━━━━━━━━━━━━━━━━━━━━━━╯

Use assim:

,feriados 2026`;
        }

        const { data } = await brasilApi.get(`/feriados/v1/${ano}`);

        if (!Array.isArray(data) || data.length === 0) {
            return `📅 Nenhum feriado encontrado para ${ano}.`;
        }

        let msg = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃    📅 *FERIADOS ${ano}*
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

        data.forEach(feriado => {
            msg += `📌 *${formatarDataBR(feriado.date)}*\n`;
            msg += `${feriado.name || 'Feriado'}\n`;
            msg += `Tipo: ${feriado.type || 'Não informado'}\n\n`;
        });

        return msg.trim();
    } catch (err) {
        console.error('Erro feriados:', err.response?.status, err.response?.data || err.message);

        return '❌ Não consegui buscar os feriados agora.';
    }
};