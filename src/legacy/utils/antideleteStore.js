const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/antidelete.json');

function readDB() {
    try {
        if (fs.existsSync(dbPath)) {
            return JSON.parse(fs.readFileSync(dbPath));
        }
    } catch (error) {
        console.error('Erro ao ler antidelete.json:', error);
    }
    return {};
}

function writeDB(data) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function isAntideleteOn(groupId) {
    const db = readDB();
    return db[groupId] === true;
}

function setAntidelete(groupId, value) {
    const db = readDB();
    db[groupId] = value;
    writeDB(db);
}

module.exports = { isAntideleteOn, setAntidelete };