// src/services/stop-game.js

const activeGames = new Map(); // groupId -> gameObject

// Banco de dados leve para validação real das categorias
const DICTIONARY = {
  frutas: new Set([
    "abacate", "abacaxi", "acerola", "amora", "banana", "caju", "caqui",
    "carambola", "cereja", "coco", "damasco", "figo", "framboesa", "goiaba",
    "graviola", "jabuticaba", "jaca", "kiwi", "laranja", "limao", "maca",
    "mamao", "manga", "maracuja", "melancia", "melao", "morango", "nectarina",
    "pera", "pessego", "pitanga", "pitaya", "roma", "tangerina", "uva"
  ]),
  animais: new Set([
    "abelha", "aguia", "anta", "aranha", "arara", "baleia", "barata", "besouro",
    "bode", "boi", "borboleta", "bufalo", "cabra", "cachorro", "camelo", "canguru",
    "capivara", "caranguejo", "cavalo", "zebra", "chimpanze", "cisne", "cobra",
    "coelho", "coruja", "crocodilo", "elefante", "esquilo", "foca", "formiga",
    "gaivota", "galinha", "galo", "ganso", "gato", "gaviao", "girafa", "golfinho",
    "gorila", "hipopotamo", "hiena", "iguana", "jacare", "jaguar", "javali",
    "joaninha", "lagarto", "leao", "leopardo", "lhama", "lobo", "lontra", "lula",
    "macaco", "morcego", "mosca", "mula", "onca", "ornitorrinco", "ostra", "ovelha",
    "pato", "pavao", "peixe", "pelicano", "periquito", "peru", "pinguim", "piolho",
    "polvo", "pombo", "porco", "raposa", "rato", "rinoceronte", "sapo", "serpente",
    "tamandua", "tartaruga", "tatu", "tigre", "touro", "tubarao", "tucano", "urso",
    "urubu", "vaca", "veado", "vespa", "zebra"
  ]),
  cores: new Set([
    "amarelo", "anil", "azul", "bege", "bordô", "bordo", "branco", "bronze",
    "caramelo", "castanho", "ciano", "cinza", "coral", "creme", "dourado",
    "escarlate", "esmeralda", "fucsia", "gelo", "grafite", "indigo", "jade",
    "laranja", "lavanda", "lilas", "magenta", "marfim", "marrom", "mostarda",
    "ocre", "oliva", "ouro", "prata", "preto", "purpura", "rosa", "roxo",
    "rubi", "salmao", "sepia", "terracota", "turquesa", "verde", "vermelho",
    "vinho", "violeta"
  ]),
  paises: new Set([
    "afeganistao", "africa do sul", "alemanha", "angola", "argentina", "argelia",
    "australia", "austria", "belgica", "bolivia", "brasil", "bulgaria", "canada",
    "catar", "chile", "china", "colombia", "coreia do norte", "coreia do sul",
    "costa rica", "croacia", "cuba", "dinamarca", "egito", "equador", "escocia",
    "espanha", "estados unidos", "etiopia", "filipinas", "finlandia", "franca",
    "gana", "grecia", "guatemala", "haiti", "holanda", "honduras", "hungria",
    "india", "indonesia", "inglaterra", "ira", "iraque", "irlanda", "islandia",
    "israel", "italia", "jamaica", "japao", "jordania", "libano", "libia",
    "luxemburgo", "malasia", "marrocos", "mexico", "mocambique", "monaco",
    "nepal", "nicaragua", "nigeria", "noruega", "nova zelandia", "panama",
    "paquistao", "paraguai", "peru", "polonia", "portugal", "quenia",
    "reino unido", "republica dominicana", "romenia", "russia", "senegal",
    "servia", "siria", "suecia", "suica", "tailandia", "taiwan", "tanzania",
    "tunisia", "turquia", "ucrania", "uganda", "uruguai", "vaticano",
    "venezuela", "vietna"
  ]),
  veiculos: new Set([
    "aviao", "ambulancia", "barco", "bicicleta", "bonde", "buggy", "caminhao",
    "caminhonete", "canoa", "carro", "carroca", "carreta", "charrete", "drone",
    "escavadeira", "foguete", "furgao", "helicoptero", "iate", "jangada", "jato",
    "jipe", "jet ski", "kombi", "lancha", "limusine", "locomotiva", "metro",
    "monociclo", "moto", "motocicleta", "navio", "onibus", "patinete", "quadriciclo",
    "retroescavadeira", "saveiro", "scooter", "submarino", "taxi", "trator",
    "trem", "triciclo", "van", "veleiro"
  ])
};

const CATEGORIES = [
  { key: "nome", label: "Nome de Pessoa", type: "open" },
  { key: "filme", label: "Nome de Filme/Série", type: "open" },
  { key: "veiculo", label: "Veículo", type: "veiculos" },
  { key: "animal", label: "Animal", type: "animais" },
  { key: "fruta", label: "Fruta", type: "frutas" },
  { key: "pais", label: "País", type: "paises" },
  { key: "cor", label: "Cor", type: "cores" },
];

const LETTERS = "ABCDEFGHIJLMNOPRSTUV"; // Letras jogáveis em português

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

  // Verifica se começa com a letra sorteada
  if (!clean.startsWith(letter.toLowerCase())) return false;

  // Categorias fechadas validam contra o dicionário
  if (category.type !== "open" && DICTIONARY[category.type]) {
    return DICTIONARY[category.type].has(clean);
  }

  // Categorias abertas (Nome e Filme): exige pelo menos 3 letras, vogal e sem spam de caracteres repetidos
  if (clean.length < 3) return false;
  if (!/[aeiou]/.test(clean)) return false;
  if (/(.)\1{2,}/.test(clean)) return false; // Bloqueia "aaaa", "bbbb"

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
    submissions: new Map(), // playerJid -> { name, answers: {}, valid: {} }
    timer: null,
  };

  // Encerra automaticamente após 90 segundos se não atingir 4 jogadores
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
    return { ignored: true }; // Já enviou resposta nesta rodada
  }

  if (game.submissions.size >= game.maxPlayers) {
    return { ignored: true };
  }

  // Faz o parse das linhas coladas pelo usuário
  const lines = rawText.split("\n");
  const parsedAnswers = {};

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const labelPart = normalizeText(line.slice(0, colonIdx));
    const valuePart = line.slice(colonIdx + 1).trim();

    const matchedCategory = CATEGORIES.find((cat) =>
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

  // Se atingiu o máximo de 4 jogadores, encerra na hora e manda o resultado no grupo
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

  // Conta frequência de respostas válidas por categoria para calcular 10 pts vs 5 pts
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

  // Ranking final ordenado
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