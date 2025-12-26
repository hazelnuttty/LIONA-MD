const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const print = require('../lib/print.js');
const handleJadibotMessage = require('../lib/handlerJadBot.js');
const { createDatabase } = require('../lib/jadibotDatabase.js');
const mainConfig = require('../config.js');
const { isOwner } = require('../lib/owner.js');

const jadibots = new Map();
const sessionsDir = path.join(__dirname, '..', 'sessions');
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
}
function getSessionId(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

async function startJadibot(token, ownerId, mainBotInstance) {
    if (jadibots.has(token)) {
        print.warn(`Jadibot with token ${token.substring(0, 8)}... is already running.`);
        return;
    }

    try {
        const bot = new TelegramBot(token, { polling: true });
        const sessionId = getSessionId(token);
        
        const db = createDatabase(sessionId);
        bot.db = db;
        bot.ownerId = ownerId;
        bot.isJadibot = true;

        bot.on('polling_error', (error) => {
            print.error(error, `Jadibot Polling Error (Token: ${token.substring(0, 8)}...). Full error: ${JSON.stringify(error, null, 2)}`);
            bot.stopPolling();
            jadibots.delete(token);
        });

        const me = await bot.getMe();
        print.success(`Jadibot started: @${me.username} (Owner: ${ownerId})`);

        jadibots.set(token, { bot, ownerId, sessionId });
        handleJadibotMessage(bot, ownerId, mainBotInstance.commands);

        const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
        const sessionData = {
            token,
            ownerId,
            botId: me.id,
            botUsername: me.username,
            database: db.getDb() 
        };
        fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
        
        return { success: true, username: me.username };

    } catch (error) {
        print.error(error, `Failed to start jadibot (Token: ${token.substring(0, 8)}...)`);
        return { success: false, message: error.message };
    }
}

async function stopJadibot(token) {
    if (jadibots.has(token)) {
        const { bot, sessionId } = jadibots.get(token);
        await bot.stopPolling();
        jadibots.delete(token);

        const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
        if (fs.existsSync(sessionFile)) {
            fs.unlinkSync(sessionFile);
        }
        print.info(`Jadibot stopped and session deleted: ${sessionId}`);
        return true;
    }
    return false;
}

function initializeJadibots(mainBotInstance) {
    print.info('Initializing jadibots from sessions...');
    const files = fs.readdirSync(sessionsDir);
    let count = 0;
    let delay = 0;
    for (const file of files) {
        if (file.endsWith('.json')) {
            try {
                const filePath = path.join(sessionsDir, file);
                const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (sessionData.token && sessionData.ownerId) {
                    setTimeout(() => {
                        startJadibot(sessionData.token, sessionData.ownerId, mainBotInstance);
                    }, delay);
                    delay += 1000;
                    count++;
                }
            } catch (e) {
                print.error(e, `Failed to load jadibot session: ${file}`);
            }
        }
    }
    if (count > 0) {
        print.success(`${count} jadibot(s) restored and will be started.`);
    }
}

module.exports = {
    name: 'jadibot',
    category: 'owner',
    description: 'Create or stop a new bot instance (jadibot).',
    async execute(bot, msg, args) {
        const { chat, from } = msg;

        if (chat.type !== 'private') {
            return bot.sendMessage(chat.id, 'This command can only be used in a private chat.');
        }
        
        if (!isOwner(from.id)) {
            return bot.sendMessage(chat.id, 'This command is restricted to the main bot owner.');
        }

        const [command, ...rest] = args;
        if (command === 'stop') {
            const tokenToStop = rest.join(' ');
            if (!tokenToStop) return bot.sendMessage(chat.id, 'Usage: .jadibot stop <TOKEN>');
            
            const stopped = await stopJadibot(tokenToStop);
            if (stopped) {
                return bot.sendMessage(chat.id, '✅ Jadibot instance stopped and session deleted.');
            } else {
                return bot.sendMessage(chat.id, '❌ No running jadibot found with that token.');
            }
        }

        const input = args.join(' ');
        if (!input || !input.includes('|')) {
            return bot.sendMessage(chat.id, 'Usage: .jadibot <TOKEN>|<OWNER_ID>\nOr: .jadibot stop <TOKEN>');
        }

        const [token, ownerId] = input.split('|').map(s => s.trim());

        if (!token || !ownerId || !/^\d+$/.test(ownerId)) {
            return bot.sendMessage(chat.id, 'Invalid format. Please use: .jadibot <TOKEN>|<OWNER_ID>');
        }

        if (jadibots.has(token)) {
            return bot.sendMessage(chat.id, 'A bot with this token is already running.');
        }

        await bot.sendMessage(chat.id, 'Attempting to create a new bot instance...');
        const result = await startJadibot(token, ownerId, bot);

        if (result.success) {
            await bot.sendMessage(chat.id, `✅ Jadibot successfully created!\nUsername: @${result.username}\nOwner: ${ownerId}`);
        } else {
            await bot.sendMessage(chat.id, `❌ Failed to create jadibot. Is the token correct? Error: ${result.message}`);
        }
    },
    initializeJadibots
};
