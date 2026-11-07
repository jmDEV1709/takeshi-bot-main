const perguntas = [
    'Eu nunca saí sem checar se o celular estava na mão.',
    'Eu nunca fingi que estava ocupado para não responder mensagem.',
    'Eu nunca ri de algo só para não ficar sem graça.',
    'Eu nunca disse que ia dormir cedo e fiquei no celular até tarde.',
    'Eu nunca comi algo escondido e neguei depois.',
    'Eu nunca mandei mensagem no grupo errado.',
    'Eu nunca apaguei uma mensagem e fiquei torcendo para ninguém ter visto.',
    'Eu nunca respondi “kkkk” sem ter rido de verdade.',
    'Eu nunca fiquei procurando o celular enquanto ele estava na minha mão.',
    'Eu nunca abri a geladeira várias vezes sem pegar nada.',
    'Eu nunca esqueci o que ia falar no meio da frase.',
    'Eu nunca coloquei o despertador e mesmo assim acordei atrasado.',
    'Eu nunca deixei uma mensagem no vácuo sem querer.',
    'Eu nunca fingi que entendi uma explicação.',
    'Eu nunca disse “já estou chegando” ainda estando em casa.',
    'Eu nunca usei o celular com 1% de bateria achando que ia dar tempo.',
    'Eu nunca tirei print de uma conversa para mostrar para alguém.',
    'Eu nunca enviei áudio e depois me arrependi.',
    'Eu nunca escrevi uma mensagem enorme e apaguei tudo antes de enviar.',
    'Eu nunca fiquei olhando status só por curiosidade.',
    'Eu nunca entrei no WhatsApp só para ver se alguém estava online.',
    'Eu nunca troquei o nome de alguém sem querer.',
    'Eu nunca esqueci onde deixei a chave.',
    'Eu nunca fui pegar algo em outro cômodo e esqueci o que era.',
    'Eu nunca falei sozinho em voz alta.',
    'Eu nunca cantei errado uma música com muita confiança.',
    'Eu nunca pesquisei uma palavra simples no Google só para confirmar.',
    'Eu nunca tive preguiça de responder um áudio longo.',
    'Eu nunca pulei um áudio para o final só para ver se era importante.',
    'Eu nunca fingi que não vi uma mensagem.',
    'Eu nunca fiquei com vergonha depois de mandar uma mensagem.',
    'Eu nunca respondi uma conversa mentalmente e esqueci de responder de verdade.',
    'Eu nunca fiquei horas escolhendo uma foto para postar.',
    'Eu nunca apaguei uma postagem depois de publicar.',
    'Eu nunca mandei figurinha sem querer.',
    'Eu nunca salvei uma figurinha só porque achei engraçada.',
    'Eu nunca perdi tempo vendo memes sem perceber.',
    'Eu nunca fiquei repetindo uma música várias vezes.',
    'Eu nunca falei “só mais cinco minutos” e passou muito mais tempo.',
    'Eu nunca deixei tarefa para última hora.',
    'Eu nunca inventei uma desculpa para não sair.',
    'Eu nunca disse “vou começar amanhã” e não comecei.',
    'Eu nunca fiquei com fome de madrugada.',
    'Eu nunca comi algo e depois me arrependi.',
    'Eu nunca escondi comida para comer depois.',
    'Eu nunca fiquei indeciso escolhendo o que comer.',
    'Eu nunca esqueci comida no micro-ondas.',
    'Eu nunca tomei susto com notificação alta.',
    'Eu nunca pensei que tinha perdido algo e estava no bolso.',
    'Eu nunca fiquei sem saber se respondia ou não uma mensagem.',
    'Eu nunca li uma mensagem pela notificação para não aparecer visualizado.',
    'Eu nunca fiquei esperando alguém responder.',
    'Eu nunca usei uma figurinha como resposta porque não sabia o que falar.',
    'Eu nunca mandei “bom dia” só por educação.',
    'Eu nunca entrei em uma chamada sem querer.',
    'Eu nunca deixei o microfone ligado sem perceber.',
    'Eu nunca me confundi com horário de compromisso.',
    'Eu nunca esqueci aniversário de alguém.',
    'Eu nunca disse que estava tudo bem sem estar com vontade de explicar.',
    'Eu nunca fiquei nervoso antes de falar com alguém importante.',
    'Eu nunca ensaiei uma conversa antes de mandar mensagem.',
    'Eu nunca reli uma mensagem várias vezes antes de enviar.',
    'Eu nunca achei que tinha enviado uma mensagem, mas não tinha.',
    'Eu nunca deixei o celular cair no rosto enquanto usava deitado.',
    'Eu nunca derrubei algo tentando fazer várias coisas ao mesmo tempo.',
    'Eu nunca tropecei e fingi que nada aconteceu.',
    'Eu nunca acenei para alguém achando que era outra pessoa.',
    'Eu nunca respondi alguém achando que estavam falando comigo.',
    'Eu nunca fiquei procurando óculos usando os óculos.',
    'Eu nunca esqueci o nome de alguém logo depois de conhecer.',
    'Eu nunca tentei abrir uma porta empurrando quando era para puxar.',
    'Eu nunca falei “presente” antes de chamarem meu nome.',
    'Eu nunca errei uma palavra simples e tentei disfarçar.',
    'Eu nunca fiquei rindo sozinho lembrando de alguma coisa.',
    'Eu nunca fiquei vendo vídeos curtos por muito mais tempo do que planejei.',
    'Eu nunca tive preguiça de levantar para pegar água.',
    'Eu nunca pedi para alguém pegar algo que estava perto de mim.',
    'Eu nunca fiquei com vergonha de perguntar algo simples.',
    'Eu nunca fiz conta na calculadora mesmo sendo fácil.',
    'Eu nunca copiei e colei algo sem ler direito.',
    'Eu nunca esqueci de salvar um arquivo importante.',
    'Eu nunca fechei uma aba sem querer.',
    'Eu nunca fiquei irritado com internet lenta.',
    'Eu nunca reiniciei algo esperando que resolvesse magicamente.',
    'Eu nunca esqueci uma senha.',
    'Eu nunca usei “123456” ou algo parecido como senha provisória.',
    'Eu nunca fiquei tentando lembrar onde baixei um arquivo.',
    'Eu nunca deixei a área de trabalho cheia de arquivos.',
    'Eu nunca abri várias abas e me perdi nelas.',
    'Eu nunca falei que ia organizar algo e deixei do mesmo jeito.',
    'Eu nunca deixei roupa acumulando para guardar depois.',
    'Eu nunca adiei arrumar o quarto.',
    'Eu nunca pensei “vou só olhar rapidinho” e fiquei muito tempo.',
    'Eu nunca fiquei com preguiça de atualizar um aplicativo.',
    'Eu nunca atualizei algo e me arrependi depois.',
    'Eu nunca fiquei esperando carregar e perdi a paciência.',
    'Eu nunca apertei o botão errado por pressa.',
    'Eu nunca deixei o celular no silencioso e perdi chamada.',
    'Eu nunca respondi seco sem perceber.',
    'Eu nunca usei emoji para parecer mais simpático.',
    'Eu nunca enviei mensagem e fiquei olhando se a pessoa visualizou.'
];

module.exports = async ({ sock, message }) => {
    const grupoId = message.key.remoteJid;

    const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];

    const textoVotacao = `🎲 EU NUNCA...\n\n${pergunta}`;

    try {
        await sock.sendMessage(
            grupoId,
            {
                poll: {
                    name: textoVotacao,
                    values: [
                        '✅ Eu já',
                        '🙅 Eu nunca'
                    ],
                    selectableCount: 1
                }
            },
            { quoted: message }
        );

        return null;
    } catch (err) {
        console.error('Erro ao enviar votação Eu Nunca:', err);

        return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃       🎲 *EU NUNCA*
╰━━━━━━━━━━━━━━━━━━━━━━╯

${pergunta}

✅ Eu já
🙅 Eu nunca

⚠️ Não consegui gerar votação automática, então enviei em formato de texto.`;
    }
};