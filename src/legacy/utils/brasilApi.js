const axios = require('axios');

const brasilApi = axios.create({
    baseURL: 'https://brasilapi.com.br/api',
    timeout: 10000,
    headers: {
        Accept: 'application/json'
    }
});

function limparNumeros(valor = '') {
    return String(valor).replace(/\D/g, '');
}

function formatarCep(cep) {
    const limpo = limparNumeros(cep);

    if (limpo.length !== 8) return cep;

    return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
}

function formatarDataBR(dataIso) {
    if (!dataIso) return 'Data não informada';

    const partes = String(dataIso).split('-');

    if (partes.length !== 3) return dataIso;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

module.exports = {
    brasilApi,
    limparNumeros,
    formatarCep,
    formatarDataBR
};