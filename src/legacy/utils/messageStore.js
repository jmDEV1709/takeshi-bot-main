// Cache simples em memória (limitado para não estourar RAM)
const store = new Map();
const MAX = 500; // guarda as últimas 500 mensagens

function saveMessage(id, data) {
    if (!id) return;
    store.set(id, data);
    // Remove as mais antigas se passar do limite
    if (store.size > MAX) {
        const firstKey = store.keys().next().value;
        store.delete(firstKey);
    }
}

function getMessage(id) {
    return store.get(id);
}

module.exports = { saveMessage, getMessage };