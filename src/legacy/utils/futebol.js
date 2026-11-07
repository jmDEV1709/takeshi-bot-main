const axios = require('axios');

const api = axios.create({
    baseURL: 'https://api.dadosfutebol.com.br/v1',
    headers: {
        'Authorization': `Bearer ${process.env.FUTEBOL_API_KEY}`,
        'Accept': 'application/json'
    }
});

let cacheId = null; // guarda o id pra não buscar toda vez

async function getBrasileiraoId() {
    if (cacheId) return cacheId;
    const lista = await api.get('/campeonatos', {
        params: { status: 'andamento', temporada: '2026' }
    });
    const camps = lista.data?.data || [];
    const brasileirao = camps.find(c =>
        c.slug === 'brasileirao-serie-a' ||
        /série a|serie a|brasileir/i.test(c.nome || c.nome_popular || '')
    );
    cacheId = brasileirao?.id || null;
    return cacheId;
}

module.exports = { api, getBrasileiraoId };