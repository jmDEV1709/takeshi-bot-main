const fs = require('fs');
const path = require('path');

module.exports = async () => {

  const dbPath = path.join(
    __dirname,
    '../database/punidos.json'
  );

  if (!fs.existsSync(dbPath)) {
    return 'Nenhum punido.';
  }

  const punidos = JSON.parse(
    fs.readFileSync(dbPath)
  );

  const lista = Object.entries(punidos);

  if (lista.length === 0) {
    return '✅ Nenhum usuário punido.';
  }

  let msg = '📋 Lista de punidos\n\n';

  lista.forEach(([id, qtd]) => {
    msg += `• ${id.split('@')[0]} - ${qtd}/3\n`;
  });

  return msg;
};