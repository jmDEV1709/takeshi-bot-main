const {
    api,
    getCampeonatoIds,
    buscarNomeCampeonato,
    limitar,
    numero,
    sinal
} = require('../utils/futebolApi');

module.exports = async () => {
    const ids = getCampeonatoIds();

    let resposta = '📊 *TABELAS DOS CAMPEONATOS*\n\n';

    for (const id of ids) {
        try {
            const { data } = await api.get(`/campeonatos/${id}/tabela`);

            const info = data?.data;
            const classificacao = info?.classificacao || [];

            const nomeCampeonato =
                info?.campeonato_nome ||
                await buscarNomeCampeonato(id);

            resposta += `🏆 *${nomeCampeonato}*\n`;
            resposta += `🆔 ID: ${id}\n\n`;

            if (classificacao.length === 0) {
                resposta += '📭 Tabela sem dados disponíveis.\n\n';
                continue;
            }

            resposta += '```';
            resposta += '\nPOS TIME  P  J  V  E  D  SG\n';
            resposta += '-----------------------------\n';

            classificacao.forEach(t => {
                const pos = numero(t.posicao, 2);
                const time = limitar(t.time?.sigla || t.time?.nome || '???', 5);
                const pontos = numero(t.pontos, 2);
                const jogos = numero(t.jogos, 2);
                const vitorias = numero(t.vitorias, 2);
                const empates = numero(t.empates, 2);
                const derrotas = numero(t.derrotas, 2);
                const saldo = numero(sinal(t.saldo), 3);

                resposta += `${pos}  ${time} ${pontos} ${jogos} ${vitorias} ${empates} ${derrotas} ${saldo}\n`;
            });

            resposta += '```\n\n';
        } catch (err) {
            console.error(`Erro tabela ID ${id}:`, err.response?.status, err.response?.data || err.message);

            if (err.response?.status === 404) {
                const nome = await buscarNomeCampeonato(id);
                resposta += `⚠️ *${nome}* — ID ${id}\n`;
                resposta += `Tabela não disponível para este campeonato.\n\n`;
                continue;
            }

            if (err.response?.status === 401) {
                return '❌ Chave inválida. Confere o FUTEBOL_API_KEY no .env.';
            }

            resposta += `❌ Erro ao buscar tabela do ID ${id}.\n\n`;
        }
    }

    return resposta.trim();
};