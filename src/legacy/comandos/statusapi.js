const axios = require('axios');

const api = axios.create({
    baseURL: 'https://api.dadosfutebol.com.br/v1',
    headers: {
        'Authorization': `Bearer ${process.env.FUTEBOL_API_KEY}`,
        'Accept': 'application/json'
    }
});

module.exports = async () => {
    try {
        const { data } = await api.get('/status');
        const status = data?.data?.status || data?.status || 'ok';
        return `✅ *API de futebol online!*\nStatus: ${status}`;
    } catch (err) {
        console.error('Erro status:', err.response?.status, err.message);
        return '❌ A API de futebol parece estar fora do ar.';
    }
};