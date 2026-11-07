const { salvarQuiz } = require('../utils/quizStore');

/*
 * Formato compacto:
 *
 * [
 *   categoria,
 *   pergunta,
 *   [alternativa1, alternativa2, alternativa3, alternativa4],
 *   respostaCorreta
 * ]
 */

const perguntasFaceis = [
    [
        'Geografia',
        'Qual é a capital do Brasil?',
        ['Brasília', 'Salvador', 'São Paulo', 'Rio de Janeiro'],
        'Brasília'
    ],
    [
        'Ciências',
        'Qual planeta é conhecido como Planeta Vermelho?',
        ['Marte', 'Vênus', 'Saturno', 'Mercúrio'],
        'Marte'
    ],
    [
        'Matemática',
        'Quanto é 9 vezes 7?',
        ['54', '63', '72', '81'],
        '63'
    ],
    [
        'Corpo Humano',
        'Qual órgão bombeia o sangue pelo corpo?',
        ['Pulmão', 'Coração', 'Fígado', 'Estômago'],
        'Coração'
    ],
    [
        'Animais',
        'Qual é o maior animal terrestre?',
        ['Elefante-africano', 'Girafa', 'Rinoceronte', 'Hipopótamo'],
        'Elefante-africano'
    ],
    [
        'Brasil',
        'Qual é a moeda oficial do Brasil?',
        ['Peso', 'Real', 'Euro', 'Dólar'],
        'Real'
    ],
    [
        'Português',
        'Qual destas palavras está escrita corretamente?',
        ['Excessão', 'Exceção', 'Eseção', 'Ecessão'],
        'Exceção'
    ],
    [
        'Geografia',
        'Qual oceano banha a costa brasileira?',
        ['Pacífico', 'Atlântico', 'Índico', 'Ártico'],
        'Atlântico'
    ],
    [
        'Esportes',
        'Quantos jogadores cada time possui em campo no futebol tradicional?',
        ['9', '10', '11', '12'],
        '11'
    ],
    [
        'Ciências',
        'Qual gás é utilizado pelo corpo humano durante a respiração?',
        ['Hélio', 'Oxigênio', 'Metano', 'Hidrogênio'],
        'Oxigênio'
    ],
    [
        'Tecnologia',
        'Qual destes programas é um navegador de internet?',
        ['Chrome', 'Excel', 'Paint', 'Word'],
        'Chrome'
    ],
    [
        'Geografia',
        'Em qual continente fica o Brasil?',
        ['Ásia', 'Europa', 'América do Sul', 'África'],
        'América do Sul'
    ],
    [
        'Matemática',
        'Qual é a metade de 100?',
        ['25', '40', '50', '75'],
        '50'
    ],
    [
        'Natureza',
        'Qual parte da planta geralmente absorve água do solo?',
        ['Flor', 'Folha', 'Raiz', 'Fruto'],
        'Raiz'
    ],
    [
        'Cultura Brasileira',
        'Qual dança é tradicionalmente associada às festas juninas?',
        ['Quadrilha', 'Tango', 'Balé', 'Flamenco'],
        'Quadrilha'
    ],
    [
        'Geografia',
        'Qual é a capital da Argentina?',
        ['Lima', 'Buenos Aires', 'Montevidéu', 'Santiago'],
        'Buenos Aires'
    ],
    [
        'Português',
        'Qual destas palavras é um verbo?',
        ['Correr', 'Mesa', 'Azul', 'Janela'],
        'Correr'
    ],
    [
        'Ciências',
        'A água congela normalmente a quantos graus Celsius?',
        ['0 °C', '10 °C', '50 °C', '100 °C'],
        '0 °C'
    ],
    [
        'História',
        'Quem foi o primeiro imperador do Brasil?',
        ['Dom Pedro I', 'Dom Pedro II', 'Deodoro da Fonseca', 'Getúlio Vargas'],
        'Dom Pedro I'
    ],
    [
        'Música',
        'Quantas notas existem na sequência musical básica de dó a si?',
        ['Cinco', 'Seis', 'Sete', 'Oito'],
        'Sete'
    ],
    [
        'Animais',
        'Qual destes animais é um mamífero?',
        ['Golfinho', 'Tubarão', 'Sardinha', 'Polvo'],
        'Golfinho'
    ],
    [
        'Matemática',
        'Quanto é 144 dividido por 12?',
        ['10', '11', '12', '14'],
        '12'
    ],
    [
        'Geografia',
        'Qual é a capital de Portugal?',
        ['Porto', 'Lisboa', 'Coimbra', 'Braga'],
        'Lisboa'
    ],
    [
        'Tecnologia',
        'Qual aparelho é normalmente usado para mover o cursor de um computador?',
        ['Mouse', 'Roteador', 'Monitor', 'Microfone'],
        'Mouse'
    ],
    [
        'Esportes',
        'Em qual esporte se utiliza uma cesta e uma bola?',
        ['Basquete', 'Tênis', 'Natação', 'Golfe'],
        'Basquete'
    ],
    [
        'Ciências',
        'Qual estrela ilumina a Terra durante o dia?',
        ['Lua', 'Sol', 'Sírius', 'Vênus'],
        'Sol'
    ],
    [
        'Geografia',
        'Qual é o maior país da América do Sul em território?',
        ['Argentina', 'Brasil', 'Peru', 'Colômbia'],
        'Brasil'
    ],
    [
        'Português',
        'Qual é o plural correto de papel?',
        ['Papels', 'Papéis', 'Papeles', 'Papelsões'],
        'Papéis'
    ],
    [
        'Conhecimentos Gerais',
        'Quantos dias possui uma semana?',
        ['Cinco', 'Seis', 'Sete', 'Oito'],
        'Sete'
    ],
    [
        'Arte',
        'Quem pintou a Mona Lisa?',
        ['Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet', 'Vincent van Gogh'],
        'Leonardo da Vinci'
    ],
    [
        'História do Brasil',
        'Em que ano ocorreu a Independência do Brasil?',
        ['1500', '1822', '1888', '1889'],
        '1822'
    ],
    [
        'Geografia',
        'Qual é a capital do estado do Rio de Janeiro?',
        ['Niterói', 'Petrópolis', 'Rio de Janeiro', 'Maricá'],
        'Rio de Janeiro'
    ],
    [
        'Ciências',
        'Qual destes animais passa por uma fase de lagarta?',
        ['Borboleta', 'Gato', 'Sapo', 'Águia'],
        'Borboleta'
    ],
    [
        'Matemática',
        'Qual é o resultado de 25 mais 37?',
        ['52', '62', '72', '82'],
        '62'
    ],
    [
        'Alimentação',
        'Qual alimento é produzido pelas abelhas?',
        ['Mel', 'Queijo', 'Farinha', 'Iogurte'],
        'Mel'
    ],
    [
        'Geografia',
        'Qual país possui o formato frequentemente comparado ao de uma bota?',
        ['Itália', 'França', 'Espanha', 'Grécia'],
        'Itália'
    ],
    [
        'Tecnologia',
        'Qual combinação é normalmente utilizada para copiar texto no Windows?',
        ['Ctrl + C', 'Ctrl + V', 'Ctrl + Z', 'Ctrl + P'],
        'Ctrl + C'
    ],
    [
        'Esportes',
        'Qual cartão representa uma expulsão no futebol?',
        ['Branco', 'Amarelo', 'Vermelho', 'Verde'],
        'Vermelho'
    ],
    [
        'Ciências',
        'Qual é o satélite natural da Terra?',
        ['Lua', 'Sol', 'Marte', 'Plutão'],
        'Lua'
    ],
    [
        'Brasil',
        'Quantas unidades federativas o Brasil possui, incluindo o Distrito Federal?',
        ['25', '26', '27', '28'],
        '27'
    ]
];

const perguntasMedias = [
    [
        'Geografia',
        'Qual é a capital do Canadá?',
        ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
        'Ottawa'
    ],
    [
        'História',
        'Qual civilização construiu Machu Picchu?',
        ['Maia', 'Asteca', 'Inca', 'Romana'],
        'Inca'
    ],
    [
        'Ciências',
        'Qual elemento químico possui o símbolo Fe?',
        ['Flúor', 'Ferro', 'Fósforo', 'Frâncio'],
        'Ferro'
    ],
    [
        'Literatura',
        'Quem escreveu Dom Casmurro?',
        ['Machado de Assis', 'José de Alencar', 'Graciliano Ramos', 'Carlos Drummond de Andrade'],
        'Machado de Assis'
    ],
    [
        'Geografia',
        'Qual linha imaginária divide a Terra nos hemisférios Norte e Sul?',
        ['Trópico de Câncer', 'Linha do Equador', 'Meridiano de Greenwich', 'Círculo Polar Ártico'],
        'Linha do Equador'
    ],
    [
        'Biologia',
        'Qual organela celular é conhecida por produzir grande parte da energia da célula?',
        ['Mitocôndria', 'Ribossomo', 'Lisossomo', 'Complexo golgiense'],
        'Mitocôndria'
    ],
    [
        'História do Brasil',
        'Qual lei aboliu oficialmente a escravidão no Brasil?',
        ['Lei Áurea', 'Lei de Terras', 'Lei do Ventre Livre', 'Lei Eusébio de Queirós'],
        'Lei Áurea'
    ],
    [
        'Arte',
        'A obra O Grito é associada a qual artista?',
        ['Edvard Munch', 'Claude Monet', 'Salvador Dalí', 'Rembrandt'],
        'Edvard Munch'
    ],
    [
        'Matemática',
        'Qual é o valor de 15% de 200?',
        ['20', '25', '30', '35'],
        '30'
    ],
    [
        'Tecnologia',
        'O que significa a sigla CPU?',
        ['Unidade Central de Processamento', 'Controle Principal do Usuário', 'Central de Programas Universais', 'Unidade de Proteção Computacional'],
        'Unidade Central de Processamento'
    ],
    [
        'Astronomia',
        'Qual é o maior planeta do Sistema Solar?',
        ['Saturno', 'Júpiter', 'Netuno', 'Urano'],
        'Júpiter'
    ],
    [
        'Geografia',
        'Qual é a capital da Austrália?',
        ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
        'Canberra'
    ],
    [
        'Português',
        'Qual figura de linguagem atribui características humanas a seres não humanos?',
        ['Personificação', 'Hipérbole', 'Eufemismo', 'Antítese'],
        'Personificação'
    ],
    [
        'História',
        'Em qual país teve início a Revolução Industrial?',
        ['França', 'Alemanha', 'Inglaterra', 'Itália'],
        'Inglaterra'
    ],
    [
        'Ciências',
        'Qual escala é usada para medir a acidez ou alcalinidade de uma solução?',
        ['Escala Richter', 'Escala pH', 'Escala Celsius', 'Escala Beaufort'],
        'Escala pH'
    ],
    [
        'Literatura',
        'Quem escreveu O Pequeno Príncipe?',
        ['Antoine de Saint-Exupéry', 'Jules Verne', 'Victor Hugo', 'Albert Camus'],
        'Antoine de Saint-Exupéry'
    ],
    [
        'Geografia',
        'Qual deserto ocupa grande parte do norte da África?',
        ['Atacama', 'Saara', 'Gobi', 'Kalahari'],
        'Saara'
    ],
    [
        'Música',
        'Qual compositor continuou criando obras mesmo após perder grande parte da audição?',
        ['Ludwig van Beethoven', 'Antonio Vivaldi', 'Frédéric Chopin', 'Johann Strauss'],
        'Ludwig van Beethoven'
    ],
    [
        'Biologia',
        'Qual pigmento é responsável pela cor verde das plantas?',
        ['Melanina', 'Clorofila', 'Hemoglobina', 'Queratina'],
        'Clorofila'
    ],
    [
        'História do Brasil',
        'Quem foi o primeiro presidente do Brasil?',
        ['Floriano Peixoto', 'Deodoro da Fonseca', 'Prudente de Morais', 'Campos Sales'],
        'Deodoro da Fonseca'
    ],
    [
        'Tecnologia',
        'Qual protocolo é utilizado para acessar páginas da Web de forma segura?',
        ['HTTPS', 'FTP', 'SMTP', 'SSH'],
        'HTTPS'
    ],
    [
        'Matemática',
        'Qual número completa a sequência 2, 4, 8, 16, ...?',
        ['20', '24', '30', '32'],
        '32'
    ],
    [
        'Geografia',
        'Qual estreito separa a Europa da África entre Espanha e Marrocos?',
        ['Bering', 'Gibraltar', 'Ormuz', 'Bósforo'],
        'Gibraltar'
    ],
    [
        'Ciências',
        'Qual é o nome do processo pelo qual a água passa do estado líquido para o gasoso?',
        ['Condensação', 'Evaporação', 'Solidificação', 'Sublimação'],
        'Evaporação'
    ],
    [
        'Literatura Brasileira',
        'Quem escreveu Vidas Secas?',
        ['Graciliano Ramos', 'Jorge Amado', 'Érico Veríssimo', 'Guimarães Rosa'],
        'Graciliano Ramos'
    ],
    [
        'Esportes',
        'Em qual esporte os termos birdie, eagle e bogey são utilizados?',
        ['Golfe', 'Tênis', 'Beisebol', 'Críquete'],
        'Golfe'
    ],
    [
        'História',
        'A queda do Muro de Berlim ocorreu em qual ano?',
        ['1975', '1982', '1989', '1994'],
        '1989'
    ],
    [
        'Geografia',
        'Qual país possui a cidade histórica de Petra?',
        ['Egito', 'Jordânia', 'Turquia', 'Líbano'],
        'Jordânia'
    ],
    [
        'Química',
        'Qual é a fórmula química da água?',
        ['CO₂', 'H₂O', 'O₂', 'NaCl'],
        'H₂O'
    ],
    [
        'Cinema',
        'Qual profissional é responsável por coordenar artisticamente a filmagem de um filme?',
        ['Diretor', 'Projético', 'Exibidor', 'Bilheteiro'],
        'Diretor'
    ],
    [
        'Brasil',
        'Qual bioma ocorre principalmente na Região Centro-Oeste e é marcado por savanas?',
        ['Cerrado', 'Pampa', 'Caatinga', 'Mata de Araucárias'],
        'Cerrado'
    ],
    [
        'Português',
        'Na frase “Os alunos estudaram”, qual é o sujeito?',
        ['Os alunos', 'Estudaram', 'Alunos estudaram', 'Oculto'],
        'Os alunos'
    ],
    [
        'Astronomia',
        'Qual planeta é famoso por seu sistema de anéis visível?',
        ['Marte', 'Saturno', 'Mercúrio', 'Vênus'],
        'Saturno'
    ],
    [
        'Matemática',
        'Qual é a área de um retângulo de 8 cm por 5 cm?',
        ['13 cm²', '26 cm²', '40 cm²', '80 cm²'],
        '40 cm²'
    ],
    [
        'História',
        'Qual povo da Antiguidade desenvolveu a democracia em Atenas?',
        ['Gregos', 'Fenícios', 'Egípcios', 'Persas'],
        'Gregos'
    ],
    [
        'Tecnologia',
        'Em desenvolvimento web, qual tecnologia é usada principalmente para estilizar páginas?',
        ['CSS', 'SQL', 'Git', 'Node.js'],
        'CSS'
    ],
    [
        'Geografia',
        'Qual é o rio associado historicamente ao desenvolvimento do Egito Antigo?',
        ['Danúbio', 'Nilo', 'Tigre', 'Ganges'],
        'Nilo'
    ],
    [
        'Ciências',
        'Qual tipo sanguíneo é conhecido como doador universal de hemácias?',
        ['A positivo', 'AB positivo', 'O negativo', 'B negativo'],
        'O negativo'
    ],
    [
        'Conhecimentos Gerais',
        'Qual país presenteou os Estados Unidos com a Estátua da Liberdade?',
        ['França', 'Reino Unido', 'Itália', 'Espanha'],
        'França'
    ],
    [
        'História do Brasil',
        'Qual cidade foi a primeira capital do Brasil?',
        ['Salvador', 'Rio de Janeiro', 'Brasília', 'Olinda'],
        'Salvador'
    ]
];

const perguntasDificeis = [
    [
        'História Antiga',
        'Qual tratado encerrou oficialmente a Guerra do Peloponeso em 404 a.C.?',
        ['Paz de Nícias', 'Paz de Antálcidas', 'Tratado de Susa', 'Rendição de Atenas a Esparta'],
        'Rendição de Atenas a Esparta'
    ],
    [
        'Química',
        'Qual elemento possui o maior valor de eletronegatividade na escala de Pauling?',
        ['Oxigênio', 'Flúor', 'Cloro', 'Nitrogênio'],
        'Flúor'
    ],
    [
        'Literatura Brasileira',
        'A qual escola literária pertence principalmente a obra Memórias Póstumas de Brás Cubas?',
        ['Romantismo', 'Realismo', 'Arcadismo', 'Simbolismo'],
        'Realismo'
    ],
    [
        'Astronomia',
        'Qual planeta possui o período de rotação mais longo do Sistema Solar?',
        ['Mercúrio', 'Vênus', 'Urano', 'Netuno'],
        'Vênus'
    ],
    [
        'Geografia',
        'Qual é a capital constitucional da Bolívia?',
        ['La Paz', 'Sucre', 'Santa Cruz de la Sierra', 'Cochabamba'],
        'Sucre'
    ],
    [
        'Biologia',
        'Em qual fase da mitose os cromossomos se alinham no plano equatorial da célula?',
        ['Prófase', 'Metáfase', 'Anáfase', 'Telófase'],
        'Metáfase'
    ],
    [
        'Física',
        'Qual grandeza física é medida em tesla no Sistema Internacional?',
        ['Fluxo magnético', 'Indução magnética', 'Resistência elétrica', 'Carga elétrica'],
        'Indução magnética'
    ],
    [
        'História do Brasil',
        'Qual revolta ocorrida entre 1835 e 1840 abalou a província do Pará?',
        ['Sabinada', 'Cabanagem', 'Balaiada', 'Revolta Praieira'],
        'Cabanagem'
    ],
    [
        'Filosofia',
        'Quem escreveu a obra Crítica da Razão Pura?',
        ['Immanuel Kant', 'René Descartes', 'David Hume', 'Baruch Spinoza'],
        'Immanuel Kant'
    ],
    [
        'Arte',
        'Qual movimento artístico foi fundado por Kazimir Malevich?',
        ['Suprematismo', 'Futurismo', 'Dadaísmo', 'Fauvismo'],
        'Suprematismo'
    ],
    [
        'Matemática',
        'Qual é o determinante da matriz 2 por 2 formada pelas linhas [3, 4] e [2, 5]?',
        ['7', '15', '17', '23'],
        '7'
    ],
    [
        'Geografia',
        'Qual país africano é completamente cercado pelo território da África do Sul?',
        ['Lesoto', 'Essuatíni', 'Botsuana', 'Namíbia'],
        'Lesoto'
    ],
    [
        'Linguística',
        'Qual ramo da linguística estuda os sons da fala como unidades distintivas?',
        ['Semântica', 'Fonologia', 'Pragmática', 'Morfologia'],
        'Fonologia'
    ],
    [
        'História',
        'A Batalha de Hastings, decisiva para a conquista normanda da Inglaterra, ocorreu em qual ano?',
        ['800', '1066', '1215', '1337'],
        '1066'
    ],
    [
        'Química',
        'Qual é o número atômico do tungstênio?',
        ['72', '73', '74', '75'],
        '74'
    ],
    [
        'Literatura',
        'Quem escreveu o romance O Processo?',
        ['Franz Kafka', 'Thomas Mann', 'Hermann Hesse', 'Bertolt Brecht'],
        'Franz Kafka'
    ],
    [
        'Astronomia',
        'Qual é o nome da maior lua de Saturno?',
        ['Europa', 'Titã', 'Tritão', 'Ganímedes'],
        'Titã'
    ],
    [
        'Biologia',
        'Qual estrutura do néfron realiza a filtração inicial do sangue?',
        ['Alça de Henle', 'Glomérulo', 'Túbulo coletor', 'Túbulo distal'],
        'Glomérulo'
    ],
    [
        'História do Brasil',
        'A Constituição brasileira conhecida como Constituição da Mandioca foi um projeto elaborado em qual contexto?',
        ['Assembleia Constituinte de 1823', 'Revolução de 1930', 'República Velha', 'Estado Novo'],
        'Assembleia Constituinte de 1823'
    ],
    [
        'Música',
        'Quem compôs o balé A Sagração da Primavera?',
        ['Igor Stravinsky', 'Piotr Tchaikovsky', 'Sergei Rachmaninoff', 'Claude Debussy'],
        'Igor Stravinsky'
    ],
    [
        'Física',
        'Qual partícula mediadora está associada à interação eletromagnética?',
        ['Glúon', 'Fóton', 'Bóson W', 'Gráviton'],
        'Fóton'
    ],
    [
        'Geografia',
        'Qual é o lago mais profundo do mundo?',
        ['Lago Vitória', 'Lago Baikal', 'Lago Tanganica', 'Mar Cáspio'],
        'Lago Baikal'
    ],
    [
        'Filosofia',
        'O conceito de “vontade de potência” está associado a qual filósofo?',
        ['Friedrich Nietzsche', 'John Locke', 'Auguste Comte', 'Jean-Jacques Rousseau'],
        'Friedrich Nietzsche'
    ],
    [
        'Arte',
        'Qual pintor é associado ao tríptico O Jardim das Delícias Terrenas?',
        ['Hieronymus Bosch', 'Jan van Eyck', 'El Greco', 'Caravaggio'],
        'Hieronymus Bosch'
    ],
    [
        'Matemática',
        'Qual é o valor aproximado do número de Euler?',
        ['1,414', '1,618', '2,718', '3,142'],
        '2,718'
    ],
    [
        'História',
        'Qual dinastia governava a China durante as viagens marítimas de Zheng He?',
        ['Tang', 'Song', 'Ming', 'Qing'],
        'Ming'
    ],
    [
        'Literatura',
        'Em qual obra de Dante Alighieri aparecem Inferno, Purgatório e Paraíso?',
        ['A Divina Comédia', 'Decamerão', 'Orlando Furioso', 'O Príncipe'],
        'A Divina Comédia'
    ],
    [
        'Tecnologia',
        'Qual estrutura de dados segue o princípio LIFO?',
        ['Fila', 'Pilha', 'Árvore binária', 'Grafo'],
        'Pilha'
    ],
    [
        'Ciências',
        'Qual camada da atmosfera contém a maior parte do ozônio atmosférico?',
        ['Troposfera', 'Estratosfera', 'Mesosfera', 'Termosfera'],
        'Estratosfera'
    ],
    [
        'Geografia',
        'Qual estreito liga o Mar Negro ao Mar de Mármara?',
        ['Bósforo', 'Dardanelos', 'Gibraltar', 'Ormuz'],
        'Bósforo'
    ],
    [
        'História do Brasil',
        'Qual acordo encerrou a Guerra do Contestado em 1916?',
        ['Acordo de Limites entre Paraná e Santa Catarina', 'Tratado de Petrópolis', 'Tratado de Tordesilhas', 'Convênio de Taubaté'],
        'Acordo de Limites entre Paraná e Santa Catarina'
    ],
    [
        'Química',
        'Qual cientista propôs o princípio da incerteza?',
        ['Werner Heisenberg', 'Erwin Schrödinger', 'Max Planck', 'Niels Bohr'],
        'Werner Heisenberg'
    ],
    [
        'Anatomia',
        'Qual é o menor osso do corpo humano?',
        ['Estribo', 'Bigorna', 'Martelo', 'Hioide'],
        'Estribo'
    ],
    [
        'Economia',
        'Qual economista publicou A Riqueza das Nações em 1776?',
        ['Adam Smith', 'David Ricardo', 'John Maynard Keynes', 'Thomas Malthus'],
        'Adam Smith'
    ],
    [
        'Literatura Brasileira',
        'Quem escreveu o romance Grande Sertão: Veredas?',
        ['João Guimarães Rosa', 'João Cabral de Melo Neto', 'Euclides da Cunha', 'Lima Barreto'],
        'João Guimarães Rosa'
    ],
    [
        'Astronomia',
        'Em qual região do Sistema Solar está localizado Ceres?',
        ['Cinturão de asteroides', 'Cinturão de Kuiper', 'Nuvem de Oort', 'Heliopausa'],
        'Cinturão de asteroides'
    ],
    [
        'História',
        'Qual documento inglês de 1215 limitou o poder do rei João?',
        ['Magna Carta', 'Petição de Direitos', 'Bill of Rights', 'Ato de Supremacia'],
        'Magna Carta'
    ],
    [
        'Biologia',
        'Qual enzima inicia a digestão do amido na boca?',
        ['Pepsina', 'Amilase salivar', 'Tripsina', 'Lipase pancreática'],
        'Amilase salivar'
    ],
    [
        'Geografia',
        'Qual corrente marítima contribui para amenizar o clima da Europa Ocidental?',
        ['Corrente do Golfo', 'Corrente de Humboldt', 'Corrente de Benguela', 'Corrente das Canárias'],
        'Corrente do Golfo'
    ],
    [
        'Tecnologia',
        'Em bancos de dados relacionais, qual forma normal elimina dependências transitivas entre atributos não chave?',
        ['Primeira forma normal', 'Segunda forma normal', 'Terceira forma normal', 'Forma normal de Boyce-Codd'],
        'Terceira forma normal'
    ]
];

function criarPerguntas(lista, dificuldade, primeiroId) {
    return lista.map((item, index) => {
        const [
            categoria,
            pergunta,
            opcoes,
            correta
        ] = item;

        return {
            id: primeiroId + index,
            dificuldade,
            categoria,
            pergunta,
            opcoes,
            correta
        };
    });
}

const perguntas = [
    ...criarPerguntas(
        perguntasFaceis,
        'facil',
        1
    ),

    ...criarPerguntas(
        perguntasMedias,
        'medio',
        41
    ),

    ...criarPerguntas(
        perguntasDificeis,
        'dificil',
        81
    )
];

const ultimaPerguntaPorGrupo = new Map();

function embaralhar(array) {
    const copia = [...array];

    for (
        let index = copia.length - 1;
        index > 0;
        index--
    ) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1)
        );

        [
            copia[index],
            copia[randomIndex]
        ] = [
            copia[randomIndex],
            copia[index]
        ];
    }

    return copia;
}

function normalizarDificuldade(valor) {
    const texto = String(valor || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (texto === 'facil') {
        return 'facil';
    }

    if (texto === 'medio') {
        return 'medio';
    }

    if (texto === 'dificil') {
        return 'dificil';
    }

    return null;
}

function formatarDificuldade(valor) {
    if (valor === 'facil') {
        return 'Fácil 🟢';
    }

    if (valor === 'medio') {
        return 'Médio 🟡';
    }

    if (valor === 'dificil') {
        return 'Difícil 🔴';
    }

    return 'Aleatória 🎲';
}

function validarPerguntas() {
    const dificuldades = {
        facil: 0,
        medio: 0,
        dificil: 0
    };

    const ids = new Set();

    for (const item of perguntas) {
        dificuldades[item.dificuldade]++;

        if (ids.has(item.id)) {
            throw new Error(
                `ID duplicado no quiz: ${item.id}`
            );
        }

        ids.add(item.id);

        if (
            !Array.isArray(item.opcoes) ||
            item.opcoes.length !== 4
        ) {
            throw new Error(
                `A pergunta ${item.id} não possui 4 opções.`
            );
        }

        if (
            !item.opcoes.includes(item.correta)
        ) {
            throw new Error(
                `A resposta da pergunta ${item.id} ` +
                'não está entre as opções.'
            );
        }

        if (
            new Set(item.opcoes).size !== 4
        ) {
            throw new Error(
                `A pergunta ${item.id} possui opções repetidas.`
            );
        }
    }

    if (
        dificuldades.facil !== 40 ||
        dificuldades.medio !== 40 ||
        dificuldades.dificil !== 40
    ) {
        throw new Error(
            'O quiz precisa ter exatamente ' +
            '40 perguntas em cada dificuldade.'
        );
    }
}

function escolherPergunta(lista, grupoId) {
    const ultimoId =
        ultimaPerguntaPorGrupo.get(grupoId);

    let candidatas = lista.filter(
        item => item.id !== ultimoId
    );

    if (candidatas.length === 0) {
        candidatas = lista;
    }

    const escolhida = candidatas[
        Math.floor(
            Math.random() * candidatas.length
        )
    ];

    ultimaPerguntaPorGrupo.set(
        grupoId,
        escolhida.id
    );

    return escolhida;
}

validarPerguntas();

module.exports = async ({
    args,
    message
}) => {
    const grupoId =
        message.key.remoteJid;

    const argumento =
        args[0]?.toLowerCase();

    const pediuAjuda =
        argumento === 'ajuda' ||
        argumento === 'help';

    if (pediuAjuda) {
        return (
            '🧠 *QUIZ BR — COMO JOGAR*\n\n' +
            '🎲 `,quiz` — nível aleatório\n' +
            '🟢 `,quiz facil`\n' +
            '🟡 `,quiz medio`\n' +
            '🔴 `,quiz dificil`\n\n' +
            'Para responder:\n' +
            '`,responder A`, `B`, `C` ou `D`'
        );
    }

    const dificuldade =
        normalizarDificuldade(argumento);

    let lista = perguntas;

    if (dificuldade) {
        lista = perguntas.filter(
            pergunta =>
                pergunta.dificuldade ===
                dificuldade
        );
    }

    if (lista.length === 0) {
        return (
            '❌ Não encontrei perguntas ' +
            'para essa dificuldade.'
        );
    }

    const perguntaEscolhida =
        escolherPergunta(
            lista,
            grupoId
        );

    const opcoes =
        embaralhar(
            perguntaEscolhida.opcoes
        );

    const letras = [
        'A',
        'B',
        'C',
        'D'
    ];

    const indiceCorreto =
        opcoes.findIndex(
            opcao =>
                opcao ===
                perguntaEscolhida.correta
        );

    const respostaLetra =
        letras[indiceCorreto];

    salvarQuiz(
        grupoId,
        {
            perguntaId:
                perguntaEscolhida.id,

            pergunta:
                perguntaEscolhida.pergunta,

            categoria:
                perguntaEscolhida.categoria,

            dificuldade:
                perguntaEscolhida.dificuldade,

            opcoes,

            respostaCorreta:
                perguntaEscolhida.correta,

            respostaLetra
        }
    );

    let msg =
        '╭━━━━━━━━━━━━━━━━━━━━━━╮\n';

    msg +=
        '┃        🧠 *QUIZ BR*        ┃\n';

    msg +=
        '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n';

    msg +=
        `📚 *Categoria:* ` +
        `${perguntaEscolhida.categoria}\n`;

    msg +=
        `🎯 *Dificuldade:* ` +
        `${formatarDificuldade(
            perguntaEscolhida.dificuldade
        )}\n\n`;

    msg +=
        `❓ *Pergunta:*\n` +
        `${perguntaEscolhida.pergunta}\n\n`;

    msg +=
        '╭─❒ *ALTERNATIVAS*\n';

    opcoes.forEach(
        (opcao, index) => {
            msg +=
                `│ ${letras[index]}) ` +
                `${opcao}\n`;
        }
    );

    msg +=
        '╰──────────────────────╯\n\n';

    msg +=
        '✅ *Para responder:*\n';

    msg +=
        '`,responder A`, `B`, `C` ou `D`\n\n';

    msg +=
        '💡 *Escolha um nível:*\n';

    msg +=
        '🟢 `,quiz facil`\n';

    msg +=
        '🟡 `,quiz medio`\n';

    msg +=
        '🔴 `,quiz dificil`';

    return msg;
};