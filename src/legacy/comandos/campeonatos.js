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
        const { data } = await api.get('/campeonatos');
        const lista = data?.data || [];

        if (lista.length === 0) {
            return '🏆 Nenhum campeonato encontrado.';
        }

        let msg = '🏆 *CAMPEONATOS DISPONÍVEIS*\n\n';
        lista.slice(0, 20).forEach(c => {
            const nome = c.nome_popular || c.nome;
            msg += `• ${nome} (id: ${c.id})\n`;
        });

        return msg;
    } catch (err) {
        console.error('Erro campeonatos:', err.response?.status, err.message);
        if (err.response?.status === 401) return '❌ Chave inválida. Confere o FUTEBOL_API_KEY no .env.';
        return '❌ Não consegui buscar os campeonatos agora.';
    }
};