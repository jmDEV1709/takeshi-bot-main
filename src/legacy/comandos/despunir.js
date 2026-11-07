const fs = require('fs');
const path = require('path');

module.exports = async ({ message }) => {

  const mentioned =
    message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

  if (!mentioned || !mentioned[0]) {
    return 'Marque alguém.';
  }

  const alvo = mentioned[0];

  const dbPath = path.join(
    __dirname,
    '../database/punidos.json'
  );

  let punidos = {};

  if (fs.existsSync(dbPath)) {
    punidos = JSON.parse(fs.readFileSync(dbPath));
  }

  delete punidos[alvo];

  fs.writeFileSync(
    dbPath,
    JSON.stringify(punidos, null, 2)
  );

  return '✅ Punições removidas.';
};