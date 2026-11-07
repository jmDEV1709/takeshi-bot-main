const fs = require('fs');
const path = './database/muted.json';

function loadData() {
    if (!fs.existsSync(path)) {
        fs.mkdirSync('./database', { recursive: true });
        fs.writeFileSync(path, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function muteUser(groupId, userId) {
    const data = loadData();
    if (!data[groupId]) data[groupId] = [];
    if (!data[groupId].includes(userId)) data[groupId].push(userId);
    saveData(data);
}

function unmuteUser(groupId, userId) {
    const data = loadData();
    if (!data[groupId]) return;
    data[groupId] = data[groupId].filter((id) => id !== userId);
    saveData(data);
}

function isMuted(groupId, userId) {
    const data = loadData();
    return data[groupId]?.includes(userId) || false;
}

module.exports = { muteUser, unmuteUser, isMuted };