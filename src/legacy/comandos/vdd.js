const verdades = [
    'Qual foi a coisa mais engraçada que aconteceu com você recentemente?',
    'Qual comida você poderia comer todos os dias sem enjoar?',
    'Você já mandou mensagem para a pessoa errada?',
    'Qual aplicativo você mais usa no celular?',
    'Qual foi o maior mico que você já pagou em público?',
    'Você já fingiu que entendeu algo sem entender?',
    'Qual personagem de filme ou série você gostaria de ser por um dia?',
    'Você prefere acordar cedo ou dormir tarde?',
    'Você já respondeu “kkkk” sem rir de verdade?',
    'Qual sonho você ainda quer realizar?',
    'Você é mais organizado ou bagunceiro?',
    'Qual hábito você quer melhorar?',
    'Você prefere praia, campo ou cidade?',
    'Qual foi o melhor conselho que alguém já te deu?',
    'Você já ficou procurando algo que estava na sua mão?'
];

const desafios = [
    'Mande uma figurinha que represente seu dia.',
    'Escreva uma frase usando apenas emojis.',
    'Fale uma qualidade de alguém do grupo.',
    'Mande uma música que você recomenda.',
    'Escreva uma frase sem usar a letra A.',
    'Conte uma curiosidade aleatória que você sabe.',
    'Mande uma figurinha engraçada.',
    'Fale o nome de um filme usando apenas emojis.',
    'Escreva uma frase rimando.',
    'Mande uma frase motivacional improvisada.',
    'Descreva seu dia em três palavras.',
    'Mande uma frase como se estivesse em uma novela.',
    'Escreva uma frase com exatamente 5 palavras.',
    'Fale um conselho rápido para o grupo.',
    'Crie um nome fictício para uma banda.'
];

module.exports = async () => {
    const tipo = Math.random() < 0.5 ? 'verdade' : 'desafio';

    if (tipo === 'verdade') {
        const pergunta = verdades[Math.floor(Math.random() * verdades.length)];

        return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      ❓ *VERDADE OU DESAFIO*
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎲 Caiu: *VERDADE*

${pergunta}`;
    }

    const desafio = desafios[Math.floor(Math.random() * desafios.length)];

    return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      🎯 *VERDADE OU DESAFIO*
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎲 Caiu: *DESAFIO*

${desafio}`;
};