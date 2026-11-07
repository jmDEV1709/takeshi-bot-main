const { pegarQuiz, apagarQuiz } = require('../utils/quizStore');

module.exports = async ({ args, message }) => {
    const grupoId = message.key.remoteJid;
    const quiz = pegarQuiz(grupoId);

    if (!quiz) {
        return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      ❌ *SEM QUIZ ATIVO*
╰━━━━━━━━━━━━━━━━━━━━━━╯

Não existe nenhum quiz ativo neste grupo.

Use:
,quiz`;
    }

    const respostaUsuario = (args[0] || '').toUpperCase().trim();

    if (!['A', 'B', 'C', 'D'].includes(respostaUsuario)) {
        return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      ⚠️ *RESPOSTA INVÁLIDA*
╰━━━━━━━━━━━━━━━━━━━━━━╯

Use uma dessas opções:

,responder A
,responder B
,responder C
,responder D`;
    }

    apagarQuiz(grupoId);

    if (respostaUsuario === quiz.respostaLetra) {
        return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        ✅ *ACERTOU!*
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎉 Boa! Você mandou bem.

📌 *Pergunta:*
${quiz.pergunta}

✅ *Resposta correta:*
${quiz.respostaLetra}) ${quiz.respostaCorreta}`;
    }

    return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        ❌ *ERROU!*
╰━━━━━━━━━━━━━━━━━━━━━━╯

📌 *Pergunta:*
${quiz.pergunta}

👤 Sua resposta:
${respostaUsuario}

✅ *Resposta correta:*
${quiz.respostaLetra}) ${quiz.respostaCorreta}`;
};