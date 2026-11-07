const fs = require('fs');
const path = require('path');

const databaseDir = path.join(
    __dirname,
    '..',
    'database'
);

const databasePath = path.join(
    databaseDir,
    'bloqueios-secretos.json'
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

function readDatabase() {
    ensureDatabase();

    try {
        const content = fs.readFileSync(
            databasePath,
            'utf8'
        );

        if (!content.trim()) {
            return {};
        }

        const data = JSON.parse(content);

        if (
            !data ||
            typeof data !== 'object' ||
            Array.isArray(data)
        ) {
            return {};
        }

        return data;
    } catch (error) {
        console.error(
            'Erro ao ler bloqueios secretos:',
            error
        );

        return {};
    }
}

function writeDatabase(data) {
    ensureDatabase();

    const temporaryPath =
        `${databasePath}.tmp`;

    fs.writeFileSync(
        temporaryPath,
        JSON.stringify(data, null, 2),
        'utf8'
    );

    fs.renameSync(
        temporaryPath,
        databasePath
    );
}

function normalizeId(value) {
    if (!value) {
        return '';
    }

    return String(value)
        .trim()
        .split(':')[0]
        .split('@')[0]
        .replace(/\D/g, '');
}

function getUniqueIds(values) {
    const list = Array.isArray(values)
        ? values.flat(Infinity)
        : [values];

    return [
        ...new Set(
            list
                .map(normalizeId)
                .filter(Boolean)
        )
    ];
}

function bloquearSecretamente(
    groupId,
    userIds
) {
    const groupKey =
        String(groupId || '').trim();

    const normalizedIds =
        getUniqueIds(userIds);

    if (
        !groupKey ||
        normalizedIds.length === 0
    ) {
        return false;
    }

    const database = readDatabase();

    if (!Array.isArray(database[groupKey])) {
        database[groupKey] = [];
    }

    database[groupKey] = [
        ...new Set([
            ...database[groupKey]
                .map(normalizeId)
                .filter(Boolean),

            ...normalizedIds
        ])
    ];

    writeDatabase(database);

    return true;
}

function desbloquearSecretamente(
    groupId,
    userIds
) {
    const groupKey =
        String(groupId || '').trim();

    const normalizedIds =
        getUniqueIds(userIds);

    if (
        !groupKey ||
        normalizedIds.length === 0
    ) {
        return false;
    }

    const database = readDatabase();

    if (!Array.isArray(database[groupKey])) {
        return false;
    }

    const idsToRemove =
        new Set(normalizedIds);

    database[groupKey] =
        database[groupKey].filter(
            savedId =>
                !idsToRemove.has(
                    normalizeId(savedId)
                )
        );

    if (database[groupKey].length === 0) {
        delete database[groupKey];
    }

    writeDatabase(database);

    return true;
}

function isBloqueadoSecretamente(
    groupId,
    userIds
) {
    const groupKey =
        String(groupId || '').trim();

    const normalizedIds =
        getUniqueIds(userIds);

    if (
        !groupKey ||
        normalizedIds.length === 0
    ) {
        return false;
    }

    const database = readDatabase();

    if (!Array.isArray(database[groupKey])) {
        return false;
    }

    const savedIds = new Set(
        database[groupKey]
            .map(normalizeId)
            .filter(Boolean)
    );

    return normalizedIds.some(
        id => savedIds.has(id)
    );
}

module.exports = {
    bloquearSecretamente,
    desbloquearSecretamente,
    isBloqueadoSecretamente
};