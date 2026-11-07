const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB_FILE = path.join(DB_DIR, 'campeonatos-efootball.json');
const MAX_JOGADORES = 16;

function garantirBanco() {
    fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, '{}', 'utf8');
    }
}

function lerBanco() {
    garantirBanco();
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}');
    } catch (error) {
        console.error('Erro ao ler campeonatos:', error);
        return {};
    }
}

function salvarBanco(banco) {
    garantirBanco();
    const temporario = `${DB_FILE}.tmp`;
    fs.writeFileSync(temporario, JSON.stringify(banco, null, 2), 'utf8');
    fs.renameSync(temporario, DB_FILE);
}

function baseId(jid) {
    return String(jid || '').split(':')[0].split('@')[0];
}

function mesmoJogador(a, b) {
    return Boolean(a && b && baseId(a) === baseId(b));
}

function novoJogo(id, p1 = null, p2 = null) {
    return { id, p1, p2, vencedor: null };
}

function gerarRodadas(participantes) {
    const ids = participantes.map(p => p.id);
    const oitavas = Array.from({ length: 8 }, (_, i) =>
        novoJogo(`O${i + 1}`, ids[i * 2] || null, ids[i * 2 + 1] || null)
    );
    const quartas = Array.from({ length: 4 }, (_, i) => novoJogo(`Q${i + 1}`));
    const semis = Array.from({ length: 2 }, (_, i) => novoJogo(`S${i + 1}`));
    const final = [novoJogo('F1')];
    return { oitavas, quartas, semis, final };
}

function criarCampeonato(groupId, nome = 'Campeonato de eFootball') {
    const banco = lerBanco();
    const atual = banco[groupId];
    if (atual && atual.status !== 'cancelado' && atual.status !== 'finalizado') {
        throw new Error('Já existe um campeonato ativo neste grupo.');
    }

    banco[groupId] = {
        nome: String(nome).trim().slice(0, 80) || 'Campeonato de eFootball',
        status: 'inscricoes',
        limite: MAX_JOGADORES,
        criadoEm: new Date().toISOString(),
        participantes: [],
        rodadas: gerarRodadas([]),
        campeao: null
    };
    salvarBanco(banco);
    return banco[groupId];
}

function obterCampeonato(groupId) {
    return lerBanco()[groupId] || null;
}

function entrarNoCampeonato(groupId, jogador) {
    const banco = lerBanco();
    const camp = banco[groupId];

    if (!camp) throw new Error('Nenhum campeonato foi aberto neste grupo.');
    if (camp.status !== 'inscricoes') throw new Error('As inscrições já foram encerradas.');
    if (camp.participantes.some(p => mesmoJogador(p.id, jogador.id))) {
        throw new Error('Você já está inscrito no campeonato.');
    }
    if (camp.participantes.length >= MAX_JOGADORES) {
        throw new Error('As 16 vagas já foram preenchidas.');
    }

    camp.participantes.push({
        id: jogador.id,
        nome: jogador.nome || baseId(jogador.id),
        entrouEm: new Date().toISOString()
    });
    camp.rodadas = gerarRodadas(camp.participantes);

    if (camp.participantes.length === MAX_JOGADORES) {
        camp.status = 'em_andamento';
        camp.iniciadoEm = new Date().toISOString();
    }

    salvarBanco(banco);
    return camp;
}

function removerJogador(groupId, jogadorId) {
    const banco = lerBanco();
    const camp = banco[groupId];
    if (!camp) throw new Error('Nenhum campeonato foi aberto neste grupo.');
    if (camp.status !== 'inscricoes') {
        throw new Error('Só é possível remover jogadores durante as inscrições.');
    }

    const antes = camp.participantes.length;
    camp.participantes = camp.participantes.filter(p => !mesmoJogador(p.id, jogadorId));
    if (camp.participantes.length === antes) throw new Error('Esse jogador não está inscrito.');

    camp.rodadas = gerarRodadas(camp.participantes);
    salvarBanco(banco);
    return camp;
}

function embaralharChave(groupId) {
    const banco = lerBanco();
    const camp = banco[groupId];
    if (!camp) throw new Error('Nenhum campeonato foi aberto neste grupo.');
    if (camp.participantes.length !== MAX_JOGADORES) {
        throw new Error('O sorteio só pode ser feito quando as 16 vagas estiverem preenchidas.');
    }
    const temResultado = Object.values(camp.rodadas)
        .flat()
        .some(jogo => jogo.vencedor);
    if (temResultado) throw new Error('Não é possível sortear depois que um resultado foi lançado.');

    for (let i = camp.participantes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [camp.participantes[i], camp.participantes[j]] = [camp.participantes[j], camp.participantes[i]];
    }
    camp.rodadas = gerarRodadas(camp.participantes);
    camp.status = 'em_andamento';
    camp.sorteadoEm = new Date().toISOString();
    salvarBanco(banco);
    return camp;
}

function localizarJogo(camp, jogoId) {
    const id = String(jogoId || '').trim().toUpperCase();
    const mapa = { O: 'oitavas', Q: 'quartas', S: 'semis', F: 'final' };
    const rodadaNome = mapa[id[0]];
    if (!rodadaNome) return null;
    const indice = Number(id.slice(1)) - 1;
    const jogo = camp.rodadas[rodadaNome]?.[indice];
    return jogo ? { id, rodadaNome, indice, jogo } : null;
}

function registrarResultado(groupId, jogoId, vencedorId) {
    const banco = lerBanco();
    const camp = banco[groupId];
    if (!camp) throw new Error('Nenhum campeonato foi aberto neste grupo.');
    if (camp.status !== 'em_andamento') throw new Error('O campeonato ainda não está em andamento.');

    const localizado = localizarJogo(camp, jogoId);
    if (!localizado) throw new Error('Jogo inválido. Use O1–O8, Q1–Q4, S1–S2 ou F1.');
    const { rodadaNome, indice, jogo } = localizado;

    if (!jogo.p1 || !jogo.p2) throw new Error('Esse confronto ainda não está completo.');
    if (jogo.vencedor) throw new Error('Esse jogo já possui vencedor registrado.');
    if (![jogo.p1, jogo.p2].some(id => mesmoJogador(id, vencedorId))) {
        throw new Error('O vencedor informado não participa desse confronto.');
    }

    const vencedorReal = mesmoJogador(jogo.p1, vencedorId) ? jogo.p1 : jogo.p2;
    jogo.vencedor = vencedorReal;

    const proxima = {
        oitavas: 'quartas',
        quartas: 'semis',
        semis: 'final'
    }[rodadaNome];

    if (proxima) {
        const proximoJogo = camp.rodadas[proxima][Math.floor(indice / 2)];
        if (indice % 2 === 0) proximoJogo.p1 = vencedorReal;
        else proximoJogo.p2 = vencedorReal;
    } else {
        camp.campeao = vencedorReal;
        camp.status = 'finalizado';
        camp.finalizadoEm = new Date().toISOString();
    }

    salvarBanco(banco);
    return camp;
}

function cancelarCampeonato(groupId) {
    const banco = lerBanco();
    const camp = banco[groupId];
    if (!camp) throw new Error('Nenhum campeonato foi aberto neste grupo.');
    camp.status = 'cancelado';
    camp.canceladoEm = new Date().toISOString();
    salvarBanco(banco);
    return camp;
}

function nomeDoJogador(camp, id) {
    if (!id) return '⏳ VAGA';
    const jogador = camp.participantes.find(p => mesmoJogador(p.id, id));
    return jogador ? `@${baseId(jogador.id)}` : `@${baseId(id)}`;
}

function montarChaveamento(camp) {
    const status = {
        inscricoes: '🟢 INSCRIÇÕES ABERTAS',
        em_andamento: '🟡 EM ANDAMENTO',
        finalizado: '🏆 FINALIZADO',
        cancelado: '🔴 CANCELADO'
    }[camp.status] || camp.status;

    const linha = jogo => {
        const marca = jogo.vencedor ? `  ✅ ${nomeDoJogador(camp, jogo.vencedor)}` : '';
        return `*${jogo.id}*  ${nomeDoJogador(camp, jogo.p1)}  ⚔️  ${nomeDoJogador(camp, jogo.p2)}${marca}`;
    };

    const partes = [
        `╭━━━ 🏆 *${camp.nome}* ━━━╮`,
        `┃ ${status}`,
        `┃ 👥 ${camp.participantes.length}/${camp.limite} jogadores`,
        '╰━━━━━━━━━━━━━━━━━━━━╯',
        '',
        '🎮 *OITAVAS DE FINAL*',
        ...camp.rodadas.oitavas.map(linha),
        '',
        '🔥 *QUARTAS DE FINAL*',
        ...camp.rodadas.quartas.map(linha),
        '',
        '⚡ *SEMIFINAIS*',
        ...camp.rodadas.semis.map(linha),
        '',
        '👑 *FINAL*',
        ...camp.rodadas.final.map(linha)
    ];

    if (camp.status === 'inscricoes') {
        partes.push('', '📢 Para participar, digite: *,entrar*');
    }
    if (camp.campeao) {
        partes.push('', `🏆 *CAMPEÃO:* ${nomeDoJogador(camp, camp.campeao)}`);
    }
    return partes.join('\n');
}

function mencoesDoCampeonato(camp) {
    return [...new Set(camp.participantes.map(p => p.id).filter(Boolean))];
}

module.exports = {
    MAX_JOGADORES,
    baseId,
    criarCampeonato,
    obterCampeonato,
    entrarNoCampeonato,
    removerJogador,
    embaralharChave,
    registrarResultado,
    cancelarCampeonato,
    montarChaveamento,
    mencoesDoCampeonato
};
