const {
    criarCampeonato,
    obterCampeonato,
    removerJogador,
    embaralharChave,
    registrarResultado,
    cancelarCampeonato,
    montarChaveamento,
    mencoesDoCampeonato
} = require('../utils/campStore');

function contexto(message) {
    return message.message?.extendedTextMessage?.contextInfo || {};
}

function alvoDaMensagem(message) {
    const ctx = contexto(message);
    return ctx.mentionedJid?.[0] || ctx.participantAlt || ctx.participant || null;
}

async function enviarChave(sock, groupId, message, camp, cabecalho = '') {
    const texto = [cabecalho, montarChaveamento(camp)].filter(Boolean).join('\n\n');
    await sock.sendMessage(
        groupId,
        { text: texto, mentions: mencoesDoCampeonato(camp) },
        { quoted: message }
    );
}

module.exports = async ({ args, message, sock }) => {
    const groupId = message.key.remoteJid;
    const acao = (args[0] || '').toLowerCase();

    try {
        if (!acao) {
            let camp = obterCampeonato(groupId);
            if (!camp || ['cancelado', 'finalizado'].includes(camp.status)) {
                camp = criarCampeonato(groupId);
                await enviarChave(
                    sock,
                    groupId,
                    message,
                    camp,
                    '📣 *QUEM VAI ENTRAR NO CAMPEONATO?*\nDigite *,entrar* para ocupar uma vaga!'
                );
                return null;
            }
            await enviarChave(sock, groupId, message, camp);
            return null;
        }

        if (acao === 'novo' || acao === 'iniciar') {
            const nome = args.slice(1).join(' ') || 'Campeonato de eFootball';
            const camp = criarCampeonato(groupId, nome);
            await enviarChave(
                sock,
                groupId,
                message,
                camp,
                '📣 *INSCRIÇÕES ABERTAS!*\nDigite *,entrar* para participar.'
            );
            return null;
        }

        if (['chave', 'tabela', 'painel'].includes(acao)) {
            const camp = obterCampeonato(groupId);
            if (!camp) return '❌ Nenhum campeonato foi aberto neste grupo.';
            await enviarChave(sock, groupId, message, camp);
            return null;
        }

        if (acao === 'sortear') {
            const camp = embaralharChave(groupId);
            await enviarChave(sock, groupId, message, camp, '🎲 *CHAVEAMENTO SORTEADO!*');
            return null;
        }

        if (acao === 'resultado') {
            const jogoId = args[1]?.toUpperCase();
            const vencedorId = alvoDaMensagem(message);
            if (!jogoId || !vencedorId) {
                return '❌ Use *,camp resultado O1* respondendo à mensagem do vencedor, ou mencione o vencedor.';
            }
            const camp = registrarResultado(groupId, jogoId, vencedorId);
            const titulo = camp.status === 'finalizado'
                ? '🏆 *TEMOS UM CAMPEÃO!*'
                : `✅ *RESULTADO DE ${jogoId} REGISTRADO!*`;
            await enviarChave(sock, groupId, message, camp, titulo);
            return null;
        }

        if (acao === 'remover') {
            const alvo = alvoDaMensagem(message);
            if (!alvo) {
                return '❌ Use *,camp remover* respondendo à mensagem do jogador, ou mencione o jogador.';
            }
            const camp = removerJogador(groupId, alvo);
            await enviarChave(sock, groupId, message, camp, '🗑️ *JOGADOR REMOVIDO DA INSCRIÇÃO.*');
            return null;
        }

        if (acao === 'cancelar') {
            cancelarCampeonato(groupId);
            return '🔴 Campeonato cancelado. Use *,camp* para abrir um novo.';
        }

        if (acao === 'ajuda') {
            return [
                '🏆 *GERENCIADOR DE CAMPEONATO*',
                '',
                '*,camp* — abre ou mostra o campeonato',
                '*,camp novo Nome* — cria com nome personalizado',
                '*,camp chave* — mostra o chaveamento',
                '*,camp sortear* — embaralha as 16 vagas',
                '*,camp resultado O1* — responda ao vencedor',
                '*,camp remover* — responda ao jogador',
                '*,camp cancelar* — encerra o campeonato',
                '',
                '👥 Participantes usam: *,entrar*',
                '',
                'IDs: O1–O8, Q1–Q4, S1–S2 e F1.'
            ].join('\n');
        }

        return '❌ Opção inválida. Use *,camp ajuda*.';
    } catch (error) {
        return `❌ ${error.message}`;
    }
};
