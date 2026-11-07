const verdades = [
    'Qual foi a coisa mais engraçada que aconteceu com você recentemente?',
    'Qual comida você poderia comer todos os dias sem enjoar?',
    'Qual foi a última coisa que te fez rir muito?',
    'Você já mandou mensagem para a pessoa errada?',
    'Qual aplicativo você mais usa no celular?',
    'Qual música você escutaria no repeat sem cansar?',
    'Qual foi o maior mico que você já pagou em público?',
    'Você já fingiu que entendeu algo sem entender?',
    'Qual foi a coisa mais aleatória que você já pesquisou na internet?',
    'Qual personagem de filme ou série você gostaria de ser por um dia?',
    'Você prefere acordar cedo ou dormir tarde?',
    'Qual foi a última coisa que você comprou e gostou muito?',
    'Você já esqueceu o nome de alguém logo depois de conhecer?',
    'Qual lugar do Brasil você tem vontade de conhecer?',
    'Qual talento você gostaria de ter?',
    'Você já riu em um momento que não podia?',
    'Qual foi a última figurinha que você salvou?',
    'Você já respondeu “kkkk” sem rir de verdade?',
    'Qual comida você não gosta de jeito nenhum?',
    'Qual foi uma mania sua que poucas pessoas sabem?',
    'Você prefere praia, campo ou cidade?',
    'Qual foi a melhor fase da sua vida até agora?',
    'Você já apagou uma mensagem e se arrependeu?',
    'Qual foi o melhor conselho que alguém já te deu?',
    'Você é mais calmo ou mais ansioso?',
    'Qual matéria da escola/faculdade você acha mais difícil?',
    'Você já ficou procurando algo que estava na sua mão?',
    'Qual foi o último vídeo que você assistiu no YouTube?',
    'Você prefere conversar por áudio ou texto?',
    'Qual emoji você mais usa?',
    'Você já fingiu estar ocupado para não responder alguém?',
    'Qual foi a última coisa que você aprendeu?',
    'Você prefere doce ou salgado?',
    'Qual filme você recomenda para todo mundo?',
    'Qual série você assistiria de novo?',
    'Você já cantou errado uma música com confiança?',
    'Qual foi o pior presente que você já ganhou?',
    'Você é mais organizado ou bagunceiro?',
    'Qual sonho você ainda quer realizar?',
    'Você já se atrasou por um motivo bobo?',
    'Qual foi a última coisa que te deixou orgulhoso?',
    'Você prefere frio ou calor?',
    'Qual animal você teria se pudesse escolher qualquer um?',
    'Você já teve vergonha de perguntar algo simples?',
    'Qual foi a melhor viagem que você já fez?',
    'Você é mais de planejar ou improvisar?',
    'Qual jogo marcou sua infância?',
    'Qual comida te lembra infância?',
    'Você já esqueceu uma senha importante?',
    'Qual hábito você quer melhorar?'
];

module.exports = async () => {
    const pergunta = verdades[Math.floor(Math.random() * verdades.length)];

    return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        ❓ *VERDADE*
╰━━━━━━━━━━━━━━━━━━━━━━╯

${pergunta}

━━━━━━━━━━━━━━━━━━━━━━
🎲 Pergunta sorteada automaticamente.`;
};