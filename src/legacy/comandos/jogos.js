const {
    api,
    getCampeonatoIds,
    buscarNomeCampeonato,
    formatarPlacar
} = require('../utils/futebolApi');

module.exports = async () => {
    const ids = getCampeonatoIds();

    try {
        const aoVivoResp = await api.get('/partidas/ao-vivo');
        const aoVivo = aoVivoResp.data?.data || [];

        if (aoVivo.length > 0) {
            let msg = '🔴 *JOGOS AO VIVO AGORA*\n\n';
            msg += '```';
            msg += '\nPLACAR AO VIVO\n';
            msg += '-----------------------------\n';

            aoVivo.forEach(jogo => {
                msg += `${formatarPlacar(jogo)}\n`;
            });

            msg += '```';

            return msg;
        }
    } catch (err) {
        console.error('Erro ao vivo:', err.response?.status, err.response?.data || err.message);
    }

    let resposta = '📅 *PRÓXIMOS JOGOS*\n\n';

    for (const id of ids) {
        try {
            const nomeCampeonato = await buscarNomeCampeonato(id);

            const { data } = await api.get(`/campeonatos/${id}/partidas`, {
                params: {
                    status: 'aguardando',
                    por_pagina: 8
                }
            });

            const partidas = data?.data || [];

            resposta += `🏆 *${nomeCampeonato}*\n`;
            resposta += `🆔 ID: ${id}\n\n`;

            if (partidas.length === 0) {
                resposta += '📭 Nenhum próximo jogo encontrado.\n\n';
                continue;
            }

            resposta += '```';
            resposta += '\nCONFRONTOS\n';
            resposta += '-----------------------------\n';

            partidas.forEach(jogo => {
                resposta += `${formatarPlacar(jogo)}\n`;
            });

            resposta += '```\n\n';
        } catch (err) {
            console.error(`Erro jogos ID ${id}:`, err.response?.status, err.response?.data || err.message);

            if (err.response?.status === 404) {
                const nome = await buscarNomeCampeonato(id);
                resposta += `⚠️ *${nome}* — ID ${id}\n`;
                resposta += `Partidas não disponíveis neste campeonato.\n\n`;
                continue;
            }

            if (err.response?.status === 401) {
                return '❌ Chave inválida. Confere o FUTEBOL_API_KEY no .env.';
            }

            resposta += `❌ Erro ao buscar jogos do ID ${id}.\n\n`;
        }
    }

    return resposta.trim();
};