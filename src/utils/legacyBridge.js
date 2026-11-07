import { createRequire } from "node:module";
import { LEGACY_PREFIX } from "../config.js";
import { isAdmin } from "../middlewares/index.js";

const require = createRequire(import.meta.url);

const commandModules = {
  menu: "menu",
  sticker: "sticker",
  ia: "ia",
  imagem: "imagem",
  piada: "piada",
  curiosidade: "curiosidade",
  eununca: "eununca",
  brincadeira: "eununca",
  ban: "ban",
  upadm: "promover",
  downadm: "rebaixar",
  open: "abrirgrupo",
  close: "fechargrupo",
  mute: "mute",
  unmute: "desmutar",
  adivinha: "adivinha",
  gay: "gay",
  pecados: "pecados",
  punir: "punir",
  listarpunidos: "listarpunidos",
  despunir: "despunir",
  antidelete: "antidelete",
  jogos: "jogos",
  camp: "camp",
  entrar: "entrar",
  tabela: "tabela",
  campeonatos: "campeonatos",
  artilharia: "artilharia",
  rodadas: "rodadas",
  rodada: "rodadas",
  statusapi: "statusapi",
  usoapi: "usoapi",
  quiz: "quiz",
  responder: "responder",
  blackjack: "blackjack",
  hit: "hit",
  stand: "stand",
  compatibilidade: "ship",
  ship: "ship",
  verdade: "verdade",
  desafio: "desafio",
  vdd: "vdd",
  cep: "cep",
  ddd: "ddd",
  feriados: "feriados",
  banco: "banco",
  play: "play",
  x: "x",
  coop: "coop",
  eu1: "coop",
  eu2: "coop",
  cantadas: "cantada",
  cantada: "cantada",
  castigar: "castigar",
  descastigar: "descastigar",
  quando: "quando",
  tarot: "tarot",
  insta: "insta",
  tk: "tk",
  proteger: "proteger",
  naval: "naval",
  shoot: "shoot",
  exit: "exit",
  limpar: "limpar",
};

const handlers = new Map();

function getHandler(commandName) {
  const moduleName = commandModules[commandName];

  if (!moduleName) {
    return null;
  }

  if (!handlers.has(moduleName)) {
    handlers.set(moduleName, require(`../legacy/comandos/${moduleName}.js`));
  }

  const handler = handlers.get(moduleName);

  if (moduleName === "coop") {
    return handler[commandName];
  }

  return handler;
}

export async function executeLegacyCommand({
  commandName,
  args,
  socket,
  webMessage,
  sendReply,
}) {
  const handler = getHandler(commandName);

  if (!handler) {
    await sendReply(
      `Comando não encontrado no modo ${LEGACY_PREFIX}. Use ${LEGACY_PREFIX}menu.`,
    );
    return true;
  }

  const remoteJid = webMessage.key.remoteJid;
  const userLid =
    webMessage.key.participant || webMessage.key.participantAlt;
  const groupMetadata = await socket.groupMetadata(remoteJid);
  const botIds = [socket.user?.id, socket.user?.lid].filter(Boolean);
  const botParticipant = groupMetadata.participants.find((participant) =>
    botIds.includes(participant.id) ||
    botIds.includes(participant.jid) ||
    botIds.includes(participant.lid),
  );
  const isBotAdmin = ["admin", "superadmin"].includes(botParticipant?.admin);
  const senderIsAdmin = await isAdmin({ remoteJid, userLid, socket });

  const result = await handler({
    args,
    message: webMessage,
    sock: socket,
    isAdmin: senderIsAdmin,
    isBotAdmin,
  });

  if (typeof result === "string" && result.trim()) {
    await sendReply(result);
  }

  return true;
}
