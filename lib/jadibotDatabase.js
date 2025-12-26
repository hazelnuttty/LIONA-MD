const fs = require('fs');
const path = require('path');
const print = require('./print');
function createDatabase(sessionId) {
    const dbPath = path.join(__dirname, '..', 'sessions', `${sessionId}.json`);
    let database = {};
    function loadDb() {
        try {
            if (fs.existsSync(dbPath)) {
                const data = fs.readFileSync(dbPath, 'utf8');
                const parsedData = JSON.parse(data);
                database = parsedData.database || parsedData;
            } else {
                database = { chats: {}, bans: [], config: { botMode: 'public' } };
                saveDb();
            }
        } catch (error) {
            print.error(error, `Jadibot DB Load (${sessionId})`);
            database = { chats: {}, bans: [] };
        }
    }
    function saveDb() {
        try {
            let sessionData = {};
            if (fs.existsSync(dbPath)) {
                try {
                    sessionData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                } catch (e) {
                    print.error(e, `Jadibot Session Read for Save (${sessionId})`);
                    sessionData = {};
                }
            }
            const dataToSave = { ...sessionData, database };
            fs.writeFileSync(dbPath, JSON.stringify(dataToSave, null, 2), 'utf8');
        } catch (error) {
            print.error(error, `Jadibot DB Save (${sessionId})`);
        }
    }
    loadDb();
    const dbInstance = {
        getChatConfig(chatId) {
            if (!database.chats) database.chats = {};
            if (!database.chats[chatId]) {
                database.chats[chatId] = {
                    antiLink: false,
                    antiImage: false,
                    welcome: { enabled: false, message: 'Selamat datang {user} di grup {group}!' },
                    leave: { enabled: false, message: 'Selamat tinggal {user}!' },
                    antiSpam: { enabled: false }
                };
                saveDb();
            }
            return database.chats[chatId];
        },
        updateChatConfig(chatId, newConfig) {
            if (!database.chats) database.chats = {};
            database.chats[chatId] = { ...this.getChatConfig(chatId), ...newConfig };
            saveDb();
        },
        getBotConfig() {
            if (!database.config) {
                database.config = { botMode: 'public' };
                saveDb();
            }
            return database.config;
        },
        updateBotConfig(newConfig) {
            database.config = { ...this.getBotConfig(), ...newConfig };
            saveDb();
        },
        addBan(id) {
            if (!database.bans) database.bans = [];
            if (!database.bans.includes(id)) {
                database.bans.push(id);
                saveDb();
            }
        },
        removeBan(id) {
            if (!database.bans) database.bans = [];
            database.bans = database.bans.filter(bannedId => String(bannedId) !== String(id));
            saveDb();
        },
        isBanned(id) {
            return database.bans && database.bans.includes(id);
        },
        getDb: () => database,
        saveDb
    };
    return dbInstance;
}
module.exports = { createDatabase };