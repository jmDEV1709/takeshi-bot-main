const coopState = {}; // { groupId: { equipe1: [], equipe2: [], ativo: false } }

function getState(groupId) {
    if (!coopState[groupId]) {
        coopState[groupId] = { equipe1: [], equipe2: [], ativo: false };
    }
    return coopState[groupId];
}

function montarMensagemStatus(state) {
    const e1 = state.equipe1.length
        ? state.equipe1.map((n, i) => `${i + 1}. @${n.split('@')[0]}`).join('\n')
        : '_vazia_';
    const e2 = state.equipe2.length
        ? state.equipe2.map((n, i) => `${i + 1}. @${n.split('@')[0]}`).join('\n')
        : '_vazia_';

    return `🎮 *COOP eFootball*\n\n*Equipe 1* (${state.equipe1.length}/3)\n${e1}\n\n*Equipe 2* (${state.equipe2.length}/3)\n${e2}\n\nDigite *,eu1* ou *,eu2* pra entrar. *,coop off* zera tudo.`;
}

async function coop({ args, message }) {
    const remoteJid = message.key.remoteJid;

    if (args[0]?.toLowerCase() === 'off') {
        coopState[remoteJid] = { equipe1: [], equipe2: [], ativo: false };
        return '🔄 Coop encerrado! Equipes zeradas.';
    }

    coopState[remoteJid] = { equipe1: [], equipe2: [], ativo: true };
    return '🎮 *Coop eFootball!*\n\nAlguém on pra jogar?\nDigite *,eu1* pra entrar na Equipe 1 ou *,eu2* pra Equipe 2.';
}

async function entrarEquipe({ message, sock }, equipeAlvo) {
    const remoteJid = message.key.remoteJid;
    const state = getState(remoteJid);

    if (!state.ativo) {
        return '⚠️ Nenhum coop ativo. Digite *,coop* pra iniciar.';
    }

    const sender = message.key.participant || remoteJid;
    const outraEquipe = equipeAlvo === 'equipe1' ? 'equipe2' : 'equipe1';

    if (state[equipeAlvo].includes(sender)) {
        return '⚠️ Você já tá nessa equipe!';
    }

    const idxOutra = state[outraEquipe].indexOf(sender);
    if (idxOutra !== -1) state[outraEquipe].splice(idxOutra, 1);

    if (state[equipeAlvo].length >= 3) {
        return `⚠️ ${equipeAlvo === 'equipe1' ? 'Equipe 1' : 'Equipe 2'} já está cheia (3/3)!`;
    }

    state[equipeAlvo].push(sender);

    await sock.sendMessage(remoteJid, {
        text: montarMensagemStatus(state),
        mentions: [...state.equipe1, ...state.equipe2]
    });
    return null; // já respondeu direto com as menções
}

async function eu1(ctx) {
    return entrarEquipe(ctx, 'equipe1');
}

async function eu2(ctx) {
    return entrarEquipe(ctx, 'equipe2');
}

module.exports = { coop, eu1, eu2 };