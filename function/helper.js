const print = require('../lib/print.js');

const spamTracker = new Map();
const SPAM_THRESHOLD = 5; 
const SPAM_TIMEFRAME = 1000; 

function escapeMarkdown(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/[_*`[\]()~>#+-=|{}.!]/g, '\\$&');
}

async function handleWelcome(bot, msg) {
    if (!msg.new_chat_members) return;

    const { chat } = msg;
    const chatConfig = bot.db.getChatConfig(chat.id);

    if (!chatConfig.welcome || !chatConfig.welcome.enabled) return;

    try {
        for (const member of msg.new_chat_members) {
            const username = escapeMarkdown(member.username ? `@${member.username}` : member.first_name);
            const groupName = escapeMarkdown(chat.title);
            
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

    const chatConfig = bot.db.getChatConfig(chat.id);
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
            const username = escapeMarkdown(from.username || from.first_name);
            await bot.sendMessage(chat.id, `@${username}, please do not spam.`);
            print.warn(`[SPAM] Detected and deleted message from ${from.id} in chat ${chat.id}`);
            return true; 
        } catch (err) {
            print.error(err, 'Anti-Spam Deletion');
        }
        spamTracker.delete(userId);
    }

    return false;
}

async function handleLeftChatMember(bot, msg) {
    if (!msg.left_chat_member) return;

    const { chat, left_chat_member: member } = msg;
    const chatConfig = bot.db.getChatConfig(chat.id);

    if (!chatConfig.leave || !chatConfig.leave.enabled) return;

    try {
        const username = escapeMarkdown(member.username ? `@${member.username}` : member.first_name);
        const groupName = escapeMarkdown(chat.title);
        
        const leaveMessage = chatConfig.leave.message
            .replace(/\{user\}/g, username)
            .replace(/\{group\}/g, groupName);

        await bot.sendMessage(chat.id, leaveMessage, { parse_mode: 'Markdown' });
    } catch (err) {
        print.error(err, 'Left Chat Member Handler');
    }
}

module.exports = { escapeMarkdown, handleWelcome, handleAntiSpam, handleLeftChatMember };
