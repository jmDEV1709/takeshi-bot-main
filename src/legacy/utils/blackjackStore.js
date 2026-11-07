const jogos = new Map();

function salvarJogada(usuario, dados) {
    jogos.set(usuario, dados);
}

function pegarJogada(usuario) {
    return jogos.get(usuario);
}

function removerJogada(usuario) {
    jogos.delete(usuario);
}

module.exports = {
    salvarJogada,
    pegarJogada,
    removerJogada
};