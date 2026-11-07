const fs = require('fs');
const path = require('path');

const databaseDir = path.join(
    __dirname,
    '..',
    'database'
);

const databasePath = path.join(
    databaseDir,
    'castigos.json'
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

        return (
            data &&
            typeof data === 'object' &&
            !Array.isArray(data)
        )
            ? data
            : {};
    } catch (error) {
        console.error(
            'Erro ao ler castigos.json:',
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

function normalizeGroupId(groupId) {
    return String(groupId || '').trim();
}

function uniqueIds(ids) {
    const normalized = ids
        .flat(Infinity)
        .map(normalizeId)
        .filter(Boolean);

    return [...new Set(normalized)];
}

function castigar(groupId, userIds) {
    const groupKey =
        normalizeGroupId(groupId);

    const ids =
        uniqueIds(
            Array.isArray(userIds)
                ? userIds
                : [userIds]
        );

    if (!groupKey || ids.length === 0) {
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

            ...ids
        ])
    ];

    writeDatabase(database);

    return true;
}

function descastigar(groupId, userIds) {
    const groupKey =
        normalizeGroupId(groupId);

    const ids =
        uniqueIds(
            Array.isArray(userIds)
                ? userIds
                : [userIds]
        );

    if (!groupKey || ids.length === 0) {
        return false;
    }

    const database = readDatabase();

    if (!Array.isArray(database[groupKey])) {
        return false;
    }

    const idsSet = new Set(ids);

    const previousLength =
        database[groupKey].length;

    database[groupKey] =
        database[groupKey].filter(
            savedId =>
                !idsSet.has(
                    normalizeId(savedId)
                )
        );

    if (database[groupKey].length === 0) {
        delete database[groupKey];
    }

    writeDatabase(database);

    return (
        previousLength !==
        (database[groupKey]?.length || 0)
    );
}

function isCastigado(groupId, userIds) {
    const groupKey =
        normalizeGroupId(groupId);

    const ids =
        uniqueIds(
            Array.isArray(userIds)
                ? userIds
                : [userIds]
        );

    if (!groupKey || ids.length === 0) {
        return false;
    }

    const database = readDatabase();

    const savedIds =
        database[groupKey];

    if (!Array.isArray(savedIds)) {
        return false;
    }

    const savedSet = new Set(
        savedIds
            .map(normalizeId)
            .filter(Boolean)
    );

    return ids.some(
        id => savedSet.has(id)
    );
}

module.exports = {
    castigar,
    descastigar,
    isCastigado,
    normalizeId,
    uniqueIds
};