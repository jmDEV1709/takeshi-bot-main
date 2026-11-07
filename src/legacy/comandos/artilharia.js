const {
    api,
    getCampeonatoIds,
    buscarNomeCampeonato,
    limitar,
    numero
} = require('../utils/futebolApi');

module.exports = async () => {
    const ids = getCampeonatoIds();

    let resposta = '👟 *ARTILHARIA DOS CAMPEONATOS*\n\n';

    for (const id of ids) {
        try {
            const { data } = await api.get(`/campeonatos/${id}/artilharia`);

            const artilheiros = data?.data || [];
            const nomeCampeonato =
                data?.meta?.campeonato_nome ||
                await buscarNomeCampeonato(id);

            resposta += `🏆 *${nomeCampeonato}*\n`;
            resposta += `🆔 ID: ${id}\n\n`;

            if (artilheiros.length === 0) {
                resposta += '📭 Artilharia sem dados disponíveis.\n\n';
                continue;
            }

            resposta += '```';
            resposta += '\n#  JOGADOR          TIME GOLS\n';
            resposta += '-----------------------------\n';

            artilheiros.slice(0, 10).forEach((a, i) => {
                const pos = numero(i + 1, 2);
                const nome = limitar(a.nome_popular || a.nome || '???', 15);
                const time = limitar(a.time?.sigla || a.time?.nome || '---', 4);
                const gols = numero(a.gols ?? 0, 2);

                resposta += `${pos} ${nome} ${time}  ${gols}\n`;
            });

            resposta += '```\n\n';
        } catch (err) {
            console.error(`Erro artilharia ID ${id}:`, err.response?.status, err.response?.data || err.message);

            if (err.response?.status === 404) {
                const nome = await buscarNomeCampeonato(id);
                resposta += `⚠️ *${nome}* — ID ${id}\n`;
                resposta += `Artilharia não disponível neste campeonato.\n\n`;
                continue;
            }

            if (err.response?.status === 401) {
                return '❌ Chave inválida. Confere o FUTEBOL_API_KEY no .env.';
            }

            resposta += `❌ Erro ao buscar artilharia do ID ${id}.\n\n`;
        }
    }

    return resposta.trim();
};