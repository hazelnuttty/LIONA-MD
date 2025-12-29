const fs = require('fs');
const path = require('path');
const print = require('./print');

const dbPath = path.join(__dirname, '../database/config.json');

let database = {};

function loadDb() {
    try {
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            database = JSON.parse(data);
        } else {
            fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
        }
    } catch (error) {
        print.error(error, 'DB Load');
        database = {};
    }
}

function saveDb() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
    } catch (error) {
        print.error(error, 'DB Save');
    }
}

loadDb();

function getChatConfig(chatId) {
    if (!database.chats) {
        database.chats = {};
    }
    if (!database.chats[chatId]) {
        database.chats[chatId] = {
            antiLink: false,
            antiImage: false,
            autoAi: {
                enabled: false,
                provider: 'groq'
            },
            welcome: {
                enabled: false,
                message: 'Selamat datang {user} di grup {group}!'
            },
            leave: {
                enabled: false,
                message: 'Selamat tinggal {user}!'
            },
            antiSpam: {
                enabled: false
            }
        };
        saveDb();
    } else if (typeof database.chats[chatId].autoAiEnabled !== 'undefined') {
        // Migrate old structure
        database.chats[chatId].autoAi = {
            enabled: database.chats[chatId].autoAiEnabled,
            provider: 'groq'
        };
        delete database.chats[chatId].autoAiEnabled;
        saveDb();
    }
    return database.chats[chatId];
}

function updateChatConfig(chatId, newConfig) {
    if (!database.chats) {
        database.chats = {};
    }
    database.chats[chatId] = { ...getChatConfig(chatId), ...newConfig };
    saveDb();
}

function addBan(id) {
    if (!database.bans) {
        database.bans = [];
    }
    if (!database.bans.includes(id)) {
        database.bans.push(id);
        saveDb();
    }
}

function removeBan(id) {
    if (!database.bans) {
        database.bans = [];
    }

    database.bans = database.bans.filter(bannedId => bannedId !== id);

    saveDb();

}

function isBanned(id) {
    return database.bans && database.bans.includes(id);

}



module.exports = {
    getChatConfig,
    updateChatConfig,
    addBan,
    removeBan,
    isBanned,
    getDb: () => database,
    saveDb
};
