// src/services/stop-game.js

const activeGames = new Map(); // groupId -> gameObject

// Banco de dados leve para validação real das categorias
const DICTIONARY = {
  frutas: new Set([
    "abacate", "abacaxi", "abiu", "abrico", "acerola", "acai", "ameixa", "amendoa",
    "amora", "araca", "araticum", "ata", "avela", "bacaba", "bacuri", "banana",
    "baru", "biriba", "buriti", "cacau", "cagaita", "caja", "caju", "caqui",
    "carambola", "castanha", "cereja", "cidra", "ciriguela", "coco", "cupuacu",
    "damasco", "embauba", "figo", "framboesa", "fruta do conde", "fruta pao",
    "goiaba", "graviola", "groselha", "guabiroba", "guaraná", "guarana", "inga",
    "jabuticaba", "jaca", "jamabo", "jambo", "jatoba", "jenipapo", "juazeiro",
    "jujuba", "kiwi", "laranja", "lichia", "limao", "longan", "maca", "macadamia",
    "mamao", "mamoncillo", "manga", "mangaba", "mangostao", "maracuja", "marolo",
    "melancia", "melao", "mirtilo", "morango", "murici", "nectarina", "nespera",
    "nira", "noz", "oxicoco", "papaia", "pequi", "pera", "pessego", "pinha",
    "pitaia", "pitanga", "pitaya", "pitomba", "pomelo", "puça", "puca", "rambutao",
    "roma", "sapoti", "seriguela", "tamarindo", "tangerina", "tapereba", "tomate",
    "toranja", "tucuma", "umbu", "umari", "uva", "uvaia", "veludo", "xixá", "xixa"
  ]),
  animais: new Set([
    "abelha", "abutre", "acaro", "aguia", "albacora", "albatroz", "alce", "alpaca",
    "anaconda", "anchova", "anguia", "anta", "antilocapra", "aranha", "arara",
    "ariranha", "armadillo", "arraia", "atum", "avestruz", "babuino", "bacalhau",
    "badejo", "bagre", "baiacu", "baleia", "barata", "barbo", "barracuda", "beija flor",
    "bem te vi", "besouro", "bezerro", "bicho preguica", "bisao", "boa", "bode",
    "boi", "bonobo", "borboleta", "boto", "bufalo", "burro", "cabra", "cacatua",
    "cachorro", "cagado", "caiao", "calango", "camaleao", "camarao", "camelo",
    "canario", "canguru", "capivara", "caracol", "caranguejo", "carapau", "cardeal",
    "carneiro", "carpa", "carrapato", "cascavel", "castor", "cateto", "cavalo",
    "cavalo marinho", "cavia", "cegonha", "chacal", "chameleon", "chinchila",
    "chimpanze", "cigarra", "cisne", "coala", "cobra", "codorna", "coelho",
    "coiote", "coleira", "condor", "coruja", "corvo", "cotia", "craca", "crocodilo",
    "cupim", "curio", "cutia", "damiao", "danado", "dgongo", "diabo da tasmania",
    "dinossauro", "doninha", "dourado", "dragao de comodo", "dromedario", "egua",
    "elefante", "ema", "enguia", "enxova", "escorpiao", "esquilo", "estrela do mar",
    "faisao", "falcao", "furão", "furao", "flamingo", "foca", "formiga", "frango",
    "fura-bolo", "gafanhoto", "gaivota", "galinha", "galo", "gamba", "ganso",
    "garca", "gato", "gaviao", "gazela", "gecko", "gerbo", "gibao", "girafa",
    "gnu", "golfinho", "gorila", "gralha", "grilo", "guara", "guaxinim", "harpia",
    "hiena", "hipopotamo", "huskie", "husky", "iara", "ibis", "iguana", "impala",
    "irara", "jabuti", "jaca", "jacare", "jacutinga", "jaguar", "jaguatirica",
    "jararaca", "javali", "jiboia", "joaninha", "joao de barro", "jumento",
    "kinkajou", "kiwi", "koala", "krill", "lagarta", "lagartixa", "lagarto",
    "lagosta", "lampreia", "leao", "leao marinho", "lebre", "lemure", "leopardo",
    "lhama", "libelula", "lince", "lobo", "lobo guara", "lombriga", "lontra",
    "lula", "macaco", "macaco prego", "mamute", "manati", "mandril", "mangusto",
    "manta", "mariposa", "marreco", "marsupial", "marta", "medusa", "meerkat",
    "mergulhao", "mexilhao", "mico", "mico leao dourado", "minhoca", "morsa",
    "morcego", "mosca", "mosquito", "mula", "murucututu", "naja", "narval",
    "nautilus", "nhambu", "niala", "ninho", "ocelote", "okapi", "onca", "onca pintada",
    "orangotango", "orca", "orinoco", "ornitorrinco", "ostra", "otaria", "ovelha",
    "paca", "pacu", "panda", "pantera", "papagaio", "parati", "pardal", "pato",
    "pavao", "peixe", "peixe boi", "peixe espada", "peixe lua", "pelicano",
    "percevejo", "perdiz", "perereca", "periquito", "pernilongo", "peru", "pescada",
    "picapau", "pinguim", "piolho", "piranha", "pirarucu", "piroca", "planaria",
    "platipus", "polvo", "pombo", "ponei", "porco", "porco espinho", "porquinho da india",
    "preguica", "presa", "pulga", "puma", "quati", "quero quero", "quetzal",
    "raia", "rã", "ra", "raposa", "rato", "ratazana", "raya", "rena", "rinoceronte",
    "robalo", "rouxinol", "sabiá", "sabia", "salamandra", "salmao", "sanguessuga",
    "sapo", "sardinha", "sauim", "serpente", "sertanejo", "suricata", "surucucu",
    "tainha", "tamandua", "tamboril", "tapioca", "tarantula", "tartaruga", "tatu",
    "tatu bola", "tatu canastra", "tatu galinha", "teiu", "tenia", "tentaculo",
    "terrapin", "texugo", "tigre", "tilapia", "tinamou", "tordo", "toupeira",
    "touro", "traca", "traira", "tritao", "truta", "tubarao", "tubarao martelo",
    "tucano", "tucunare", "tuco tuco", "tuiuiu", "tuna", "turaco", "urso",
    "urso panda", "urso polar", "urubu", "vaca", "vaquinha", "veado", "vespa",
    "viuva negra", "vombate", "wallaby", "xareu", "xenopus", "yak", "zangao",
    "zebra", "zebu", "zorrilho"
  ]),
  cores: new Set([
    "alabastro", "amarelo", "amarelo canario", "amarelo ouro", "amarelo queimado",
    "ambar", "ametista", "anil", "aquamarina", "areia", "argentado", "aurore",
    "avela", "azul", "azul bebe", "azul celeste", "azul cobalto", "azul marinho",
    "azul pavão", "azul pavao", "azul petroleo", "azul royal", "azul turquesa",
    "bege", "berinjela", "bordo", "branco", "branco gelo", "branco neve",
    "branco perola", "bronze", "caqui", "caramelo", "carmesim", "carmin",
    "castanho", "castanho claro", "castanho escuro", "cobre", "celeste", "ceruleo",
    "champanhe", "ciano", "cinza", "cinza chumbo", "cinza claro", "cinza escuro",
    "cinza prata", "cinza rato", "citrino", "cobalto", "conhaque", "coral",
    "creme", "ciano", "damasco", "dourado", "ebano", "escarlate", "esmeralda",
    "ferrugem", "fucsia", "gelo", "grena", "grafite", "heliotropio", "indigo",
    "jade", "jambo", "laranja", "laranja neon", "lavanda", "lilas", "limao",
    "loiro", "louro", "magenta", "magno", "malva", "marfim", "marrom",
    "marrom cafe", "marrom chocolate", "mel", "mostarda", "musgo", "neve",
    "ocre", "oliva", "ouro", "ouro velho", "palha", "pessego", "perola",
    "petroleo", "pinhao", "prata", "prateado", "preto", "preto fosco", "purpura",
    "quartzo", "rosa", "rosa bebe", "rosa choque", "rosa claro", "rosa pink",
    "rosa queimado", "rosa salmon", "roxo", "rubi", "salmao", "sandalo",
    "sepia", "tabaco", "tangerina", "telha", "terracota", "tijolo", "turquesa",
    "uva", "verde", "verde agua", "verde bandeira", "verde claro", "verde escuro",
    "verde folha", "verde limao", "verde militar", "verde musgo", "verde oliva",
    "verde pantano", "verde piscina", "vermelho", "vermelho sangue", "vermelho vivo",
    "vinho", "violeta", "vison", "xisto", "zafira"
  ]),
  paises: new Set([
    "afeganistao", "africa do sul", "albania", "alemanha", "andorra", "angola",
    "antigua e barbuda", "arabia saudita", "argelia", "argentina", "armenia",
    "australia", "austria", "azerbaijao", "bahamas", "bahrein", "bangladesh",
    "barbados", "belarus", "belgica", "belize", "benim", "bolivia",
    "bosnia e herzegovina", "botsuana", "brasil", "brunei", "bulgaria",
    "burkina faso", "burundi", "butao", "cabo verde", "camaroes", "camboja",
    "canada", "catar", "cazaquistao", "chade", "chile", "china", "chipre",
    "colombia", "comores", "congo", "coreia do norte", "coreia do sul",
    "costa do marfim", "costa rica", "croacia", "cuba", "dinamarca", "djibuti",
    "dominica", "egito", "el salvador", "emirados arabes unidos", "equador",
    "eritreia", "escocia", "eslovaquia", "eslovenia", "espanha", "estados unidos",
    "estonia", "essuatini", "etiopia", "fiji", "filipinas", "finlandia",
    "franca", "gabao", "gambia", "gana", "georgia", "granada", "grecia",
    "guatemala", "guiana", "guine", "guine equatorial", "guine bissau", "haiti",
    "honduras", "hungria", "iemen", "ilhas marshall", "ilhas salomao", "india",
    "indonesia", "inglaterra", "ira", "iraque", "irlanda", "irlanda do norte",
    "islandia", "israel", "italia", "jamaica", "japao", "jordania", "kiribati",
    "kuwait", "laos", "lesoto", "letonia", "libano", "liberia", "libia",
    "liechtenstein", "lituania", "luxemburgo", "macedonia do norte", "madagascar",
    "malasia", "malaui", "maldivas", "mali", "malta", "marrocos", "mauricio",
    "mauritania", "mexico", "mianmar", "micronesia", "mocambique", "moldavia",
    "monaco", "mongolia", "montenegro", "namibia", "nauru", "nepal", "nicaragua",
    "niger", "nigeria", "noruega", "nova zelandia", "oma", "pais de gales",
    "paises baixos", "palau", "palestina", "panama", "papua nova guine",
    "paquistao", "paraguai", "peru", "polonia", "portugal", "quenia",
    "quirguistao", "reino unido", "republica centro africana",
    "republica checa", "republica democratica do congo", "republica dominicana",
    "romenia", "ruanda", "russia", "sao cristovao e nevis", "sao marinho",
    "sao tome e principe", "sao vicente e granadinas", "seicheles", "senegal",
    "serra leoa", "servia", "singapura", "siria", "somalia", "sri lanka",
    "sudao", "sudao do sul", "suecia", "suica", "suriname", "tailandia", "taiwan", "tanzania", "tchequia", "togo", "tonga", "trindade e tobago", "tunisia", "turcomenistao", "turquia", "tuvalu",
    "ucrania", "uganda", "uruguai", "uzbequistao", "vanuatu", "vaticano",
    "venezuela", "vietna", "zambia", "zimbabue"
  ]),
};

const CATEGORIES = [
  { key: "nome", emoji: "👤", label: "Nome de Pessoa", type: "open" },
  { key: "filme", emoji: "🎬", label: "Filme ou Série", type: "open" },
  { key: "veiculo", emoji: "🚗", label: "Veículo", type: "veiculos" },
  { key: "animal", emoji: "🐾", label: "Animal", type: "animais" },
  { key: "fruta", emoji: "🍎", label: "Fruta", type: "frutas" },
  { key: "pais", emoji: "🌍", label: "País", type: "paises" },
  { key: "cor", emoji: "🎨", label: "Cor", type: "cores" },
];

const LETTERS = "ABCDEFGHIJLMNOPRSTUV";

function normalizeText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

function generateGameId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function validateAnswer(category, rawAnswer, letter) {
  const clean = normalizeText(rawAnswer);
  if (!clean || clean.length < 2) return false;


  if (!clean.startsWith(letter.toLowerCase())) return false;


  if (category.type !== "open" && DICTIONARY[category.type]) {
    return DICTIONARY[category.type].has(clean);
  }


  if (clean.length < 3) return false;
  if (!/[aeiou]/.test(clean)) return false;
  if (/(.)\1{2,}/.test(clean)) return false;

  return true;
}

export function startStopGame(groupId, onFinishCallback) {
  if (activeGames.has(groupId)) {
    return { error: "Já existe uma partida de STOP em andamento neste grupo!" };
  }

  const gameId = generateGameId();
  const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];

  const game = {
    id: gameId,
    groupId,
    letter,
    maxPlayers: 4,
    submissions: new Map(),
    timer: null,
  };


  game.timer = setTimeout(() => {
    finishStopGame(groupId, onFinishCallback, "⏰ Tempo esgotado!");
  }, 90_000);

  activeGames.set(groupId, game);
  return { game, categories: CATEGORIES };
}

export function findGameById(gameId) {
  const targetId = String(gameId || "").trim().toUpperCase();
  for (const game of activeGames.values()) {
    if (game.id === targetId) return game;
  }
  return null;
}

export function submitStopAnswers(gameId, playerJid, playerName, rawText, onFinishCallback) {
  const game = findGameById(gameId);
  if (!game) return { ignored: true };

  if (game.submissions.has(playerJid)) {
    return { ignored: true };
  }

  if (game.submissions.size >= game.maxPlayers) {
    return { ignored: true };
  }

  const lines = rawText.split(/\r?\n/);
  const parsedAnswers = {};

  for (const line of lines) {
    const cleanLine = line.replace(/\*/g, "").trim();
    const colonIdx = cleanLine.indexOf(":");
    if (colonIdx === -1) continue;

    const labelPart = normalizeText(cleanLine.slice(0, colonIdx));
    const valuePart = cleanLine.slice(colonIdx + 1).trim();

    if (labelPart === "id" || labelPart === "letra") continue;

    const matchedCategory = CATEGORIES.find(
      (cat) =>
        labelPart.includes(normalizeText(cat.key)) ||
        labelPart.includes(normalizeText(cat.label))
    );

    if (matchedCategory) {
      parsedAnswers[matchedCategory.key] = valuePart;
    }
  }

  const validMap = {};
  for (const cat of CATEGORIES) {
    const ans = parsedAnswers[cat.key] || "";
    validMap[cat.key] = validateAnswer(cat, ans, game.letter);
  }

  game.submissions.set(playerJid, {
    jid: playerJid,
    name: playerName,
    answers: parsedAnswers,
    valid: validMap,
  });

  // Verificar se o jogo está completo
  if (game.submissions.size >= game.maxPlayers) {
    clearTimeout(game.timer);
    finishStopGame(game.groupId, onFinishCallback, "🏁 Limite de 4 jogadores atingido!");
  }

  return { accepted: true };
}

export function finishStopGame(groupId, onFinishCallback, reason = "🛑 Rodada encerrada!") {
  const game = activeGames.get(groupId);
  if (!game) return null;

  clearTimeout(game.timer);
  activeGames.delete(groupId);

  const players = Array.from(game.submissions.values());

  if (players.length === 0) {
    onFinishCallback(
      groupId,
      `${reason}\n\nNinguém enviou respostas no privado para a partida *#${game.id}* (Letra *${game.letter}*).`,
      []
    );
    return;
  }

  // Calcular pontuações
  const scores = new Map();
  players.forEach((p) => scores.set(p.jid, 0));

  let report = `${reason}\n🎯 *RESULTADO DO STOP — PARTIDA #${game.id}*\n🔤 *Letra sorteada:* *${game.letter}*\n\n`;

  for (const cat of CATEGORIES) {
    report += `📌 *${cat.label}:*\n`;
    const validFrequency = new Map();

    for (const p of players) {
      if (p.valid[cat.key]) {
        const norm = normalizeText(p.answers[cat.key]);
        validFrequency.set(norm, (validFrequency.get(norm) || 0) + 1);
      }
    }

    for (const p of players) {
      const rawAns = p.answers[cat.key] || "—";
      const isValid = p.valid[cat.key];
      let pts = 0;

      if (isValid) {
        const norm = normalizeText(rawAns);
        pts = validFrequency.get(norm) > 1 ? 5 : 10;
        scores.set(p.jid, scores.get(p.jid) + pts);
      }

      const statusIcon = isValid ? `✅ (+${pts})` : `❌ (0)`;
      report += `  • @${p.jid.split("@")[0]}: ${rawAns} ${statusIcon}\n`;
    }
    report += `\n`;
  }

  // Montar o ranking
  const ranking = players
    .map((p) => ({ jid: p.jid, score: scores.get(p.jid) }))
    .sort((a, b) => b.score - a.score);

  report += `🏆 *PLACAR FINAL:*\n`;
  ranking.forEach((item, idx) => {
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "4️⃣";
    report += `${medal} @${item.jid.split("@")[0]} — *${item.score} pts*\n`;
  });

  const mentions = players.map((p) => p.jid);
  onFinishCallback(groupId, report.trim(), mentions);
}