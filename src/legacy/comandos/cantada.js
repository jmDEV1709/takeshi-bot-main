const cantadas = [
    'Você não é Wi-Fi, mas senti uma conexão forte entre nós.',

    'Você é Google? Porque tem tudo o que eu estava procurando.',

    'Você é CSS? Porque colocou estilo na minha vida.',

    'Você é JavaScript? Porque fez meu coração reagir.',

    'Você é um commit? Porque mudou completamente o meu projeto.',

    'Você trabalha com banco de dados? Porque não consigo tirar você da minha memória.',

    'Você é um bug? Porque não paro de pensar em como encontrar você.',

    'Você é uma variável constante? Porque não quero que você mude.',

    'Você é meu código? Porque mesmo com alguns erros, eu não desisto de você.',

    'Você é uma API? Porque quero criar uma conexão com você.',

    'Você é HTML? Porque dá sentido à estrutura da minha vida.',

    'Você é Git? Porque quero guardar cada momento com você.',

    'Você é um servidor? Porque meu coração fica esperando sua resposta.',

    'Você é modo escuro? Porque deixou tudo mais bonito quando apareceu.',

    'Você é inteligência artificial? Porque parece boa demais para ser real.',

    'Você é uma estrela? Porque iluminou até a parte mais escura do meu dia.',

    'Você tem um mapa? Porque me perdi quando encontrei você.',

    'Você acredita em amor à primeira mensagem ou devo mandar outra?',

    'Você é café? Porque tirou o sono e aumentou meus batimentos.',

    'Você é um boleto? Porque não consigo esquecer você.',

    'Você não é feriado, mas eu passaria o dia inteiro com você.',

    'Você é chuva de verão? Porque chegou de repente e mudou completamente o clima.',

    'Você é uma música boa? Porque ficou repetindo na minha cabeça.',

    'Você é fotografia? Porque fez meu mundo parar por um instante.',

    'Você é um sonho? Porque não quero acordar depois de encontrar você.',

    'Você é domingo? Porque eu queria que durasse muito mais.',

    'Você é o Sol? Porque meu dia começa melhor quando você aparece.',

    'Você é um livro interessante? Porque quero conhecer cada capítulo seu.',

    'Você é uma notificação? Porque sempre chama minha atenção.',

    'Você é carregador? Porque devolveu a energia que estava faltando.',

    'Você é uma bússola? Porque meu coração sempre aponta na sua direção.',

    'Você é uma obra de arte? Porque eu poderia passar horas admirando você.',

    'Você é chocolate? Porque deixou meu dia mais doce.',

    'Você é uma viagem? Porque só de pensar em você já quero arrumar as malas.',

    'Você é matemática? Porque conseguiu multiplicar minha felicidade.',

    'Você é uma equação? Porque é a solução que eu estava procurando.',

    'Você é gravidade? Porque existe alguma coisa me puxando até você.',

    'Você é eletricidade? Porque senti uma corrente quando você chegou.',

    'Você é um eclipse? Porque fez todo o resto desaparecer por alguns segundos.',

    'Você é um ímã? Porque está difícil manter distância.',

    'Você não é dicionário, mas deu um novo significado ao meu dia.',

    'Você não é relógio, mas fez meu tempo parar.',

    'Você é uma janela aberta? Porque trouxe luz para a minha vida.',

    'Você não é GPS, mas parece ter encontrado o caminho até meu coração.',

    'Você é prova surpresa? Porque apareceu do nada e acelerou meu coração.',

    'Você é uma senha forte? Porque parece difícil de conquistar, mas vale cada tentativa.',

    'Você é promoção? Porque é uma oportunidade que eu não quero perder.',

    'Você é um presente? Porque sua presença já melhorou o meu dia.',

    'Você é corretor automático? Porque apareceu e completou o que estava faltando.',

    'Você é meu projeto favorito? Porque eu passaria a noite inteira dando atenção a você.'
];

module.exports = async () => {
    const cantada = cantadas[
        Math.floor(Math.random() * cantadas.length)
    ];

    return `💘 *Cantada aleatória*\n\n${cantada}`;
};