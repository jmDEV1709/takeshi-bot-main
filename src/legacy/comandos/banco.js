const {
    brasilApi,
    limparNumeros
} = require('../utils/brasilApi');

module.exports = async ({ args }) => {
    try {
        const codigo = limparNumeros(args[0]);

        if (!codigo) {
            return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        🏦 *CONSULTA BANCO*
╰━━━━━━━━━━━━━━━━━━━━━━╯

Use assim:

,banco 001
,banco 237
,banco 341`;
        }

        const { data } = await brasilApi.get(`/banks/v1/${codigo}`);

        return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        🏦 *BANCO*
╰━━━━━━━━━━━━━━━━━━━━━━╯

🔢 *Código:* ${data.code || codigo}
🏦 *Nome:* ${data.name || 'Não informado'}
📄 *Nome completo:* ${data.fullName || 'Não informado'}
🆔 *ISPB:* ${data.ispb || 'Não informado'}`;
    } catch (err) {
        console.error('Erro banco:', err.response?.status, err.response?.data || err.message);

        if (err.response?.status === 404) {
            return '❌ Banco não encontrado.';
        }

        return '❌ Não consegui consultar esse banco agora.';
    }
};