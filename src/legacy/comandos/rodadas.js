const {
    api,
    getCampeonatoIds,
    buscarNomeCampeonato,
    formatarPlacar
} = require('../utils/futebolApi');

module.exports = async ({ args = [] } = {}) => {
    const ids = getCampeonatoIds();

    const rodadaEscolhida = args[0] && !Number.isNaN(Number(args[0]))
        ? Number(args[0])
        : null;

    let resposta = rodadaEscolhida
        ? `📅 *RODADA ${rodadaEscolhida}*\n\n`
        : '📅 *RODADAS DOS CAMPEONATOS*\n\n';

    for (const id of ids) {
        try {
            const { data } = await api.get(`/campeonatos/${id}/rodadas`);

            const rodadas = data?.data || [];
            const nomeCampeonato = await buscarNomeCampeonato(id);

            resposta += `🏆 *${nomeCampeonato}*\n`;
            resposta += `🆔 ID: ${id}\n\n`;

            if (rodadas.length === 0) {
                resposta += '📭 Nenhuma rodada encontrada.\n\n';
                continue;
            }

            let rodadaAtual;

            if (rodadaEscolhida) {
                rodadaAtual = rodadas.find(r => Number(r.numero) === rodadaEscolhida);
            } else {
                rodadaAtual =
                    rodadas.find(r => r.status === 'andamento') ||
                    rodadas.find(r => r.status === 'agendada') ||
                    rodadas.find(r => (r.partidas || []).some(p => p.status === 'ao_vivo')) ||
                    rodadas[rodadas.length - 1];
            }

            if (!rodadaAtual) {
                resposta += `⚠️ Rodada ${rodadaEscolhida} não encontrada.\n\n`;
                continue;
            }

            const partidas = rodadaAtual.partidas || [];

            resposta += `📌 *${rodadaAtual.nome || `${rodadaAtual.numero}ª Rodada`}*\n`;
            resposta += `📍 Status: ${rodadaAtual.status || 'indefinido'}\n\n`;

            if (partidas.length === 0) {
                resposta += '📭 Sem partidas nesta rodada.\n\n';
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
            console.error(`Erro rodadas ID ${id}:`, err.response?.status, err.response?.data || err.message);

            if (err.response?.status === 404) {
                const nome = await buscarNomeCampeonato(id);
                resposta += `⚠️ *${nome}* — ID ${id}\n`;
                resposta += `Rodadas não disponíveis neste campeonato.\n\n`;
                continue;
            }

            if (err.response?.status === 401) {
                return '❌ Chave inválida. Confere o FUTEBOL_API_KEY no .env.';
            }

            resposta += `❌ Erro ao buscar rodadas do ID ${id}.\n\n`;
        }
    }

    resposta += '💡 Use também: `,rodadas 5` para ver uma rodada específica.';

    return resposta.trim();
};