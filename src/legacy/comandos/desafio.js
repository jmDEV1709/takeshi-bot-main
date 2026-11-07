const desafios = [
    'Mande uma figurinha que represente seu dia.',
    'Fale uma palavra aleatória e peça para o grupo continuar uma história.',
    'Envie um áudio falando “missão cumprida” com voz séria.',
    'Mande no grupo o último emoji que você usou.',
    'Escreva uma frase usando apenas emojis.',
    'Fale uma qualidade de alguém do grupo.',
    'Mande uma música que você recomenda.',
    'Escreva uma frase sem usar a letra A.',
    'Conte uma curiosidade aleatória que você sabe.',
    'Mande uma figurinha engraçada.',
    'Fale o nome de um filme usando apenas emojis.',
    'Escreva uma frase rimando.',
    'Mande uma mensagem como se fosse narrador de futebol.',
    'Digite uma frase de trás para frente.',
    'Fale uma comida que você comeria agora.',
    'Mande uma palavra e deixe o grupo tentar adivinhar o que ela significa.',
    'Faça uma pergunta aleatória para o grupo responder.',
    'Mande uma frase motivacional improvisada.',
    'Escreva uma mensagem sem usar vogais por uma rodada.',
    'Fale um personagem que combina com você.',
    'Mande uma recomendação de filme, série ou anime.',
    'Escolha alguém do grupo e faça um elogio sincero.',
    'Fale uma coisa boa que aconteceu hoje.',
    'Mande uma frase como se fosse um robô.',
    'Crie um apelido engraçado para você mesmo.',
    'Digite uma mensagem usando só letras maiúsculas.',
    'Digite uma mensagem usando só letras minúsculas.',
    'Mande uma palavra difícil e veja quem sabe o significado.',
    'Faça uma previsão engraçada para o grupo.',
    'Fale uma meta pequena para esta semana.',
    'Mande uma frase como se fosse propaganda de TV.',
    'Fale uma coisa que você aprendeu recentemente.',
    'Crie uma hashtag engraçada para o momento.',
    'Mande uma figurinha sem contexto.',
    'Fale um lugar que você gostaria de visitar.',
    'Descreva seu dia em três palavras.',
    'Mande uma frase começando com “Hoje eu descobri que...”.',
    'Fale uma comida usando descrição, sem dizer o nome dela.',
    'Mande um trava-língua simples.',
    'Faça uma pergunta de sim ou não para o grupo.',
    'Mande uma frase como se estivesse em uma novela.',
    'Fale uma música que marcou alguma fase da sua vida.',
    'Escreva uma frase com exatamente 5 palavras.',
    'Fale algo que parece fácil, mas é difícil.',
    'Mande uma curiosidade sobre você.',
    'Faça uma escolha difícil: café ou refrigerante?',
    'Fale uma coisa que todo mundo deveria aprender.',
    'Mande uma frase usando a palavra “abacaxi”.',
    'Fale um conselho rápido para o grupo.',
    'Crie um nome fictício para uma banda.'
];

module.exports = async () => {
    const desafio = desafios[Math.floor(Math.random() * desafios.length)];

    return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃        🎯 *DESAFIO*
╰━━━━━━━━━━━━━━━━━━━━━━╯

${desafio}

━━━━━━━━━━━━━━━━━━━━━━
🎲 Desafio sorteado automaticamente.`;
};