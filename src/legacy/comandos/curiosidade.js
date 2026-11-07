const facts = [
    'As abelhas conseguem reconhecer rostos humanos.',
    'O polvo tem três corações.',
    'Bananas são tecnicamente berries, mas morangos não são.',
    'O cérebro humano consome cerca de 20% da energia do corpo em repouso.',
];

module.exports = async () => {
    try {
        const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=pt');

        if (!response.ok) {
            throw new Error('Falha ao buscar curiosidade');
        }

        const data = await response.json();

        if (data?.text) {
            return `Curiosidade:\n${data.text}`;
        }
    } catch (error) {
        // Se a API falhar, usa uma curiosidade local como alternativa.
    }

    const fact = facts[Math.floor(Math.random() * facts.length)];
    return `Curiosidade:\n${fact}`;
};
