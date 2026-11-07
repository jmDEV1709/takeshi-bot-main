const quizzes = new Map();

function salvarQuiz(grupoId, dados) {
    quizzes.set(grupoId, {
        ...dados,
        criadoEm: Date.now()
    });
}

function pegarQuiz(grupoId) {
    return quizzes.get(grupoId);
}

function apagarQuiz(grupoId) {
    quizzes.delete(grupoId);
}

module.exports = {
    salvarQuiz,
    pegarQuiz,
    apagarQuiz
};