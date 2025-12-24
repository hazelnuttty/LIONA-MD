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
            welcome: {
                enabled: false,
                message: 'Selamat datang {user} di grup {group}!'
            },
            antiSpam: {
                enabled: false
            }
        };
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

module.exports = { getChatConfig, updateChatConfig, getDb: () => database, saveDb };
