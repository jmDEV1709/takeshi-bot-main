const fs = require('fs');

const inputFile = './cookies.json';   // seu arquivo JSON exportado
const outputFile = './cookies.txt';   // arquivo final pro yt-dlp

const raw = fs.readFileSync(inputFile, 'utf8');
const data = JSON.parse(raw);

if (!data.cookies || !Array.isArray(data.cookies)) {
  throw new Error('JSON inválido: campo "cookies" não encontrado.');
}

const lines = [];
lines.push('# Netscape HTTP Cookie File');
lines.push('');

for (const c of data.cookies) {
  const domain = c.domain || '';
  const includeSubdomains = domain.startsWith('.') ? 'TRUE' : 'FALSE';
  const path = c.path || '/';
  const secure = c.secure ? 'TRUE' : 'FALSE';
  const expires = c.session ? '0' : String(Math.floor(c.expirationDate || 0));
  const name = c.name || '';
  const value = c.value || '';

  lines.push([
    domain,
    includeSubdomains,
    path,
    secure,
    expires,
    name,
    value
  ].join('\t'));
}

fs.writeFileSync(outputFile, lines.join('\r\n'), 'utf8');
console.log(`Arquivo gerado: ${outputFile}`);