const axios = require('axios');

const api = axios.create({
    baseURL: 'https://api.dadosfutebol.com.br/v1',
    headers: {
        Authorization: `Bearer ${process.env.FUTEBOL_API_KEY}`,
        Accept: 'application/json'
    }
});

function getCampeonatoIds() {
    const idsEnv = process.env.FUTEBOL_CAMPEONATO_IDS || '3,4,62';

    return idsEnv
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);
}

function centralizar(texto, tamanho) {
    texto = String(texto || '');
    if (texto.length >= tamanho) return texto.slice(0, tamanho);

    const espacos = tamanho - texto.length;
    const esquerda = Math.floor(espacos / 2);
    const direita = espacos - esquerda;

    return ' '.repeat(esquerda) + texto + ' '.repeat(direita);
}

function limitar(texto, tamanho) {
    texto = String(texto || '');
    if (texto.length > tamanho) return texto.slice(0, tamanho);
    return texto.padEnd(tamanho, ' ');
}

function numero(valor, tamanho) {
    if (valor === null || valor === undefined) return '-'.padStart(tamanho, ' ');
    return String(valor).padStart(tamanho, ' ');
}

function sinal(valor) {
    if (valor === null || valor === undefined) return '-';
    const n = Number(valor);
    if (Number.isNaN(n)) return String(valor);
    return n > 0 ? `+${n}` : String(n);
}

async function buscarCampeonato(id) {
    try {
        const { data } = await api.get(`/campeonatos/${id}`);
        return data?.data || null;
    } catch (err) {
        return null;
    }
}

async function buscarNomeCampeonato(id) {
    const campeonato = await buscarCampeonato(id);
    return campeonato?.nome || campeonato?.nome_popular || `Campeonato ${id}`;
}

function formatarDataHora(jogo) {
    const data = jogo.data_realizacao || '';
    const hora = jogo.hora_realizacao || '';

    if (data && hora) return `${data} ${hora}`;
    if (data) return data;
    if (hora) return hora;

    return 'Data indefinida';
}

function formatarPlacar(jogo) {
    const casa = jogo.time_mandante?.sigla || jogo.time_mandante?.nome || 'CASA';
    const fora = jogo.time_visitante?.sigla || jogo.time_visitante?.nome || 'FORA';

    const mandante = limitar(casa, 4);
    const visitante = limitar(fora, 4);

    const pm = jogo.placar_mandante ?? '-';
    const pv = jogo.placar_visitante ?? '-';

    if (jogo.status === 'encerrado') {
        return `✅ ${mandante} ${pm} x ${pv} ${visitante}`;
    }

    if (jogo.status === 'ao_vivo') {
        return `🔴 ${mandante} ${pm} x ${pv} ${visitante}`;
    }

    if (jogo.status === 'adiado') {
        return `⏸️ ${mandante} x ${visitante} — ADIADO`;
    }

    return `🕒 ${mandante} x ${visitante} — ${formatarDataHora(jogo)}`;
}

module.exports = {
    api,
    getCampeonatoIds,
    buscarNomeCampeonato,
    centralizar,
    limitar,
    numero,
    sinal,
    formatarPlacar,
    formatarDataHora
};