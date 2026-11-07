const fs = require('fs');
const path = require('path');

const databaseDir = path.join(
    __dirname,
    '..',
    'database'
);

const databasePath = path.join(
    databaseDir,
    'punidos.json'
);

function ensureDatabase() {
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, {
            recursive: true
        });
    }

    if (!fs.existsSync(databasePath)) {
        fs.writeFileSync(
            databasePath,
            '{}',
            'utf8'
        );
    }
}

function loadPunidos() {
    ensureDatabase();

    try {
        const content = fs.readFileSync(
            databasePath,
            'utf8'
        );

        const data = JSON.parse(content);

        if (!data || typeof data !== 'object') {
            return {};
        }

        return data;
    } catch (error) {
        console.error(
            'Erro ao carregar punições:',
            error
        );

        return {};
    }
}

function savePunidos(punidos) {
    ensureDatabase();

    fs.writeFileSync(
        databasePath,
        JSON.stringify(punidos, null, 2),
        'utf8'
    );
}

function normalizeJid(jid) {
    if (!jid) {
        return '';
    }

    return String(jid)
        .split(':')[0]
        .split('@')[0];
}

function findPunidoKey(punidos, jid) {
    const normalizedJid = normalizeJid(jid);

    return Object.keys(punidos).find(
        savedJid =>
            normalizeJid(savedJid) === normalizedJid
    );
}

function adicionarPunicao(jid) {
    if (!jid) {
        return 0;
    }

    const punidos = loadPunidos();

    const existingKey = findPunidoKey(
        punidos,
        jid
    );

    const key = existingKey || jid;

    punidos[key] =
        Number(punidos[key] || 0) + 1;

    savePunidos(punidos);

    return punidos[key];
}

function removerPunido(jid) {
    const punidos = loadPunidos();

    const existingKey = findPunidoKey(
        punidos,
        jid
    );

    if (!existingKey) {
        return false;
    }

    delete punidos[existingKey];

    savePunidos(punidos);

    return true;
}

module.exports = {
    adicionarPunicao,
    removerPunido
};