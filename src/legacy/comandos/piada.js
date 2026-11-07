const darkJokes = [
    'Meu avô morreu dormindo, tranquilamente. Bem diferente dos passageiros do ônibus que ele dirigia.',

    'Minha família é muito unida. Basta alguém morrer e deixar uma casa para todos aparecerem.',

    'O médico disse que eu tinha seis meses de vida. Como não paguei a consulta, ele reduziu para três.',

    'Minha avó sempre quis reunir toda a família. Morreu e finalmente conseguiu.',

    'Perguntei ao médico quanto tempo ainda me restava. Ele disse: “Dez”. Perguntei: “Dez o quê?”. Ele respondeu: “Nove... oito...”.',

    'No velório do meu tio disseram que ele parecia estar dormindo. Estranho seria se ele pedisse café.',

    'Minha família chorou muito no funeral. Aí o advogado anunciou que havia um testamento e todos prestaram atenção.',

    'Quero que joguem o buquê no meu funeral. Quem pegar será o próximo.',

    'Meu tio dizia que só sairia de casa morto. O proprietário levou o despejo a sério demais.',

    'A funerária ofereceu um plano familiar. Minha família perguntou se havia desconto por quantidade.',

    'O hospital pediu um contato de emergência. Passei o número da funerária para evitar burocracia.',

    'Minha avó pediu que ninguém chorasse no funeral. Todos obedeceram quando descobriram que não havia herança.',

    'No enterro, disseram que meu tio estava olhando por todos. Fecharam o caixão para devolver a privacidade.',

    'O médico disse que havia uma notícia boa e uma ruim. A boa era que dariam meu nome a uma doença nova.',

    'O cemitério aumentou os preços. Até morrer está ficando fora do orçamento.',

    'A família gastou tanto no funeral que o falecido conseguiu ficar endividado depois de morto.',

    'Meu tio nunca teve valor para a família. Então chegou o pagamento do seguro de vida.',

    'A ambulância demorou tanto que o motorista perguntou diretamente o endereço do cemitério.',

    'O médico disse que meu avô estava nas mãos de Deus. Foi uma maneira elegante de dizer que a equipe havia desistido.',

    'Meu avô morreu fazendo o que amava: ignorando todas as recomendações médicas.',

    'No funeral tocaram a música favorita do falecido. Foi a primeira vez que ele não reclamou do volume.',

    'Meu amigo trabalha no cemitério. Ele diz que os clientes são tranquilos: nunca reclamam e permanecem no local.',

    'O enterro foi tão desorganizado que o morto foi a única pessoa que chegou no horário.',

    'Minha família fez um minuto de silêncio pelo meu tio. Foi a primeira vez que deixaram ele terminar uma história.',

    'O médico recomendou repouso absoluto. A funerária apresentou um plano permanente.'
];

const punJokes = [
    'O que o pagodeiro foi fazer na igreja? Cantar pá-god.',

    'Por que o astronauta terminou o namoro? Porque precisava de espaço.',

    'Qual é o contrário de paixão? Mãe teto.',

    'Por que o jacaré tirou o filho da escola? Porque ele réptil de ano.',

    'O que o café disse para o açúcar? Sem você, minha vida é amarga.',

    'Qual é o rei dos queijos? O reiqueijão.',

    'Por que a impressora começou a fazer academia? Para ficar com o papel definido.',

    'O que aconteceu quando o lápis perdeu o emprego? Ele ficou desapontado.',

    'Por que o relógio foi expulso da escola? Porque matava o tempo durante a aula.',

    'O que o tomate foi fazer no banco? Tirar extrato.',

    'Por que o computador foi preso? Porque executou um programa.',

    'Como o elétron atende ao telefone? Próton?',

    'Por que a planta não foi atendida no hospital? Porque só tinha médico de plantão.',

    'O que o oceano disse para a praia? Nada, só deu uma onda.',

    'Qual é o animal mais antigo do mundo? A zebra, porque ainda é em preto e branco.',

    'Por que o livro de matemática terminou o relacionamento? Porque a relação estava cheia de problemas.',

    'O que um tijolo disse para o outro? Há um ciumento entre nós.',

    'Por que a bicicleta foi ao psicólogo? Porque estava cansada de viver em ciclos.',

    'Qual é a sobremesa favorita do programador? Cookie.',

    'Por que o JavaScript terminou com o HTML? Porque faltava estilo na relação.',

    'O que o Wi-Fi disse para o roteador? Sinto uma conexão forte entre nós.',

    'Por que o banco de dados foi ao médico? Porque estava com problema de relacionamento.',

    'O que o CSS disse para o HTML? Pode deixar que eu resolvo seu estilo.',

    'Por que o programador confundiu o Natal com o Halloween? Porque OCT 31 é igual a DEC 25.',

    'Por que o desenvolvedor ficou preso no banho? Porque o shampoo dizia: aplique, enxágue e repita.'
];

const jokes = [...darkJokes, ...punJokes];

module.exports = async () => {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    return `🎭 *Piada aleatória*\n\n${joke}`;
};