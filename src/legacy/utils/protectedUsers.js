const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/protegidos.json');

const DEFAULT_PROTECTED_NUMBERS = [
    '5521992439247'
];

function loadProtectedNumbers() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const saved = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

            if (Array.isArray(saved)) {
                return [...new Set([...DEFAULT_PROTECTED_NUMBERS, ...saved])];
            }
        }
    } catch (err) {
        console.error('Erro ao carregar protegidos.json:', err);
    }

    return [...DEFAULT_PROTECTED_NUMBERS];
}

function saveProtectedNumbers(numbers) {
    try {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(numbers, null, 2));
    } catch (err) {
        console.error('Erro ao salvar protegidos.json:', err);
    }
}

const PROTECTED_NUMBERS = loadProtectedNumbers();

function normalizeNumber(value) {
    return String(value || '')
        .split('@')[0]
        .split(':')[0]
        .replace(/\D/g, '');
}

function getPossibleNumbers(value) {
    const number = normalizeNumber(value);

    if (!number) {
        return [];
    }

    const numbers = new Set();

    numbers.add(number);

    if (!number.startsWith('55')) {
        numbers.add(`55${number}`);
    }

    return [...numbers];
}

function isProtectedUser(...ids) {
    return ids
        .flat()
        .filter(Boolean)
        .some(id => {
            const possibleNumbers = getPossibleNumbers(id);

            return possibleNumbers.some(number =>
                PROTECTED_NUMBERS.includes(number)
            );
        });
}

function addProtectedUser(value) {
    const possibleNumbers = getPossibleNumbers(value);
    const number = possibleNumbers.find(n => n.startsWith('55')) || possibleNumbers[0];

    if (!number) {
        return { success: false, reason: 'invalid' };
    }

    if (PROTECTED_NUMBERS.includes(number)) {
        return { success: false, reason: 'already', number };
    }

    PROTECTED_NUMBERS.push(number);
    saveProtectedNumbers(PROTECTED_NUMBERS);

    return { success: true, number };
}

module.exports = {
    isProtectedUser,
    addProtectedUser,
    PROTECTED_NUMBERS
};