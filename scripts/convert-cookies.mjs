import fs from "node:fs";

const inputFile = process.argv[2] || "cookies.json";
const outputFile = process.argv[3] || "cookies.txt";
const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

if (!Array.isArray(data.cookies)) {
  throw new Error('JSON inválido: campo "cookies" não encontrado.');
}

const lines = ["# Netscape HTTP Cookie File", ""];

for (const cookie of data.cookies) {
  const domain = cookie.domain || "";
  lines.push(
    [
      domain,
      domain.startsWith(".") ? "TRUE" : "FALSE",
      cookie.path || "/",
      cookie.secure ? "TRUE" : "FALSE",
      cookie.session ? "0" : String(Math.floor(cookie.expirationDate || 0)),
      cookie.name || "",
      cookie.value || "",
    ].join("\t"),
  );
}

fs.writeFileSync(outputFile, `${lines.join("\r\n")}\r\n`, { mode: 0o600 });
console.log(`Arquivo gerado: ${outputFile}`);
