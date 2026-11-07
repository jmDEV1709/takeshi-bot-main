const respostas = [
    'Hoje',
    'Amanhã',
    'Daqui a 7 dias',
    'Daqui a duas semanas',
    '23 dias',
    'Daqui a 1 mês',
    'Daqui a 3 meses',
    'Daqui a 6 meses',
    'Daqui a 1 ano',
    'Daqui a 2 anos',
    'Daqui a 3 anos',
    'Daqui a 4 anos',
    'Daqui a 5 anos',
    'Daqui a 10 anos',
    'Daqui a 15 anos',
    'Nunca',
    'Nem nascendo de novo'
];

module.exports = async ({ args }) => {
    const pergunta = args.join(' ').trim();

    if (!pergunta) {
        return (
            '⏳ *Como usar o comando quando*\n\n' +
            'Faça uma pergunta depois do comando.\n\n' +
            'Exemplo:\n' +
            '`,quando vou ficar rico?`'
        );
    }

    const resposta =
        respostas[Math.floor(Math.random() * respostas.length)];

    return (
        `⏳ *Quando ${pergunta}?*\n\n` +
        `🔮 *${resposta}.*`
    );
};