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
        // Endpoint de estatísticas de uso da API Key
        const { data } = await api.get('/perfil/uso');
        const info = data?.data || data;

        const usadas = info?.requisicoes_usadas ?? info?.usadas ?? '?';
        const limite = info?.limite ?? info?.requisicoes_limite ?? '?';

        return `📈 *Uso da API*\n\nRequisições usadas: ${usadas}\nLimite: ${limite}`;
    } catch (err) {
        console.error('Erro uso:', err.response?.status, err.message);
        return '❌ Não consegui buscar o uso da API. (Confere o endpoint na doc)';
    }
};