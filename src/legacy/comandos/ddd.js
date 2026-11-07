const {
    brasilApi,
    limparNumeros
} = require('../utils/brasilApi');

module.exports = async ({ args }) => {
    try {
        const ddd = limparNumeros(args[0]);

        if (!ddd || ddd.length < 2 || ddd.length > 3) {
            return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        📞 *CONSULTA DDD*
╰━━━━━━━━━━━━━━━━━━━━━━╯

Use assim:

,ddd 21`;
        }

        const { data } = await brasilApi.get(`/ddd/v1/${ddd}`);

        const cidades = data.cities || [];

        let msg = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        📞 *DDD ${ddd}*
╰━━━━━━━━━━━━━━━━━━━━━━╯

🌎 *Estado:* ${data.state || 'Não informado'}

🏙️ *Cidades:*
`;

        cidades.slice(0, 20).forEach(cidade => {
            msg += `• ${cidade}\n`;
        });

        if (cidades.length > 20) {
            msg += `\n📌 Mostrando 20 de ${cidades.length} cidades.`;
        }

        return msg.trim();
    } catch (err) {
        console.error('Erro DDD:', err.response?.status, err.response?.data || err.message);

        if (err.response?.status === 404) {
            return '❌ DDD não encontrado.';
        }

        return '❌ Não consegui consultar esse DDD agora.';
    }
};