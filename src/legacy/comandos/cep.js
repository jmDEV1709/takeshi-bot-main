const {
    brasilApi,
    limparNumeros,
    formatarCep
} = require('../utils/brasilApi');

module.exports = async ({ args }) => {
    try {
        const cep = limparNumeros(args[0]);

        if (!cep || cep.length !== 8) {
            return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        📍 *CONSULTA CEP*
╰━━━━━━━━━━━━━━━━━━━━━━╯

Use assim:

,cep 01001000

Digite apenas números ou CEP com traço.`;
        }

        const { data } = await brasilApi.get(`/cep/v2/${cep}`);

        return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        📍 *CEP ENCONTRADO*
╰━━━━━━━━━━━━━━━━━━━━━━╯

🏷️ *CEP:* ${formatarCep(data.cep || cep)}
🛣️ *Rua:* ${data.street || 'Não informado'}
🏘️ *Bairro:* ${data.neighborhood || 'Não informado'}
🏙️ *Cidade:* ${data.city || 'Não informado'}
🌎 *Estado:* ${data.state || 'Não informado'}

📌 *Coordenadas:*
Latitude: ${data.location?.coordinates?.latitude || 'Não informado'}
Longitude: ${data.location?.coordinates?.longitude || 'Não informado'}`;
    } catch (err) {
        console.error('Erro CEP:', err.response?.status, err.response?.data || err.message);

        if (err.response?.status === 404) {
            return '❌ CEP não encontrado.';
        }

        return '❌ Não consegui consultar esse CEP agora.';
    }
};