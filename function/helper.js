const db = require('../lib/database.js');
const print = require('../lib/print.js');

const spamTracker = new Map();
const SPAM_THRESHOLD = 5; 
const SPAM_TIMEFRAME = 3000; 

async function handleWelcome(bot, msg) {
    if (!msg.new_chat_members) return;

    const { chat } = msg;
    const chatConfig = db.getChatConfig(chat.id);

    if (!chatConfig.welcome || !chatConfig.welcome.enabled) return;

    try {
        for (const member of msg.new_chat_members) {
            const username = member.username ? `@${member.username}` : member.first_name;
            const groupName = chat.title;
            
            const welcomeMessage = chatConfig.welcome.message
                .replace(/\{user\}/g, username)
                .replace(/\{group\}/g, groupName);

            await bot.sendMessage(chat.id, welcomeMessage, { parse_mode: 'Markdown' });
        }
    } catch (err) {
        print.error(err, 'Welcome Handler');
    }
}

async function handleAntiSpam(bot, msg) {
    const { chat, from } = msg;
    if (!chat || !from) return false;

    const chatConfig = db.getChatConfig(chat.id);
    if (!chatConfig.antiSpam || !chatConfig.antiSpam.enabled) return false;

    const userId = from.id;
    const now = Date.now();

    if (!spamTracker.has(userId)) {
        spamTracker.set(userId, []);
    }

    const userTimestamps = spamTracker.get(userId);
    userTimestamps.push(now);

    const recentTimestamps = userTimestamps.filter(ts => now - ts < SPAM_TIMEFRAME);
    spamTracker.set(userId, recentTimestamps);

    if (recentTimestamps.length > SPAM_THRESHOLD) {
        try {
            await bot.deleteMessage(chat.id, msg.message_id);
            await bot.sendMessage(chat.id, `@${from.username || from.first_name}, please do not spam.`);
            print.warn(`[SPAM] Detected and deleted message from ${from.id} in chat ${chat.id}`);
            return true; 
        } catch (err) {
            print.error(err, 'Anti-Spam Deletion');
        }
        spamTracker.delete(userId);
    }

    return false;
}

module.exports = { handleWelcome, handleAntiSpam };
