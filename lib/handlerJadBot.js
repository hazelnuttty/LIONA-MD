const print = require('./print.js');
const path = require('path');
const helper = require('../function/helper.js');
const { escapeMarkdown } = require('../function/helper.js');
const dbModulePath = require.resolve('./database.js');
module.exports = (bot, ownerId, mainCommands) => {
    bot.commands = mainCommands;
    bot.runtime = () => {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    };
    bot.time = () => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };
    async function isChatAdmin(chat, userId) {
        if (String(userId) === String(ownerId)) return true;
        try {
            const admins = await bot.getChatAdministrators(chat.id);
            return admins.some(admin => String(admin.user.id) === String(userId));
        } catch (error) {
            return false;
        }
    }
    async function handleModeration(msg) {
        const { chat, from, message_id, text, caption, photo, entities } = msg;
        if (!chat || !from) return false;
        try {
            const chatConfig = bot.db.getChatConfig(chat.id);
            const username = escapeMarkdown(from.username ? `@${from.username}` : from.first_name);
            const chatType = chat.type === 'private' ? 'private chat' : 'group';
            const userIsAdmin = await isChatAdmin(chat, from.id);
            if (String(from.id) === String(ownerId) || userIsAdmin) {
                const isLink = (entities && entities.some(e => e.type === 'url' || e.type === 'text_link')) || (text && /https?:\/\/\S+/.test(text)) || (caption && /https?:\/\/\S+/.test(caption));
                if ((chatConfig.antiImage && photo) || (chatConfig.antiLink && isLink)) {
                     await bot.sendMessage(chat.id, `${username}, as an admin/owner, your message was not deleted.`);
                }
                return false;
            }
            if (chatConfig.antiImage && photo) {
                await bot.deleteMessage(chat.id, message_id);
                await bot.sendMessage(chat.id, `${username}, this ${chatType} has anti-image enabled.`);
                print.info(`[JADIBOT MOD] Deleted image from ${from.id} in ${chat.id}`);
                return true;
            }
            if (chatConfig.antiLink) {
                const hasLink = (entities && entities.some(e => e.type === 'url' || e.type === 'text_link')) || (text && /https?:\/\/\S+/.test(text)) || (caption && /https?:\/\/\S+/.test(caption));
                if (hasLink) {
                    await bot.deleteMessage(chat.id, message_id);
                    await bot.sendMessage(chat.id, `${username}, this ${chatType} has anti-link enabled.`);
                    print.info(`[JADIBOT MOD] Deleted link from ${from.id} in ${chat.id}`);
                    return true;
                }
            }
        } catch (error) {
            print.error(error, '[JADIBOT] Moderation System');
        }
        return false;
    }
    bot.handleModeration = (msg) => handleModeration(msg);
    bot.on('callback_query', async (q) => {
        const originalDb = require.cache[dbModulePath]?.exports;
        try {
            const botConfig = bot.db.getBotConfig();
            if (botConfig.botMode === 'self' && String(q.from.id) !== String(ownerId)) {
                return bot.answerCallbackQuery(q.id, { text: 'This bot is in self mode.', show_alert: true });
            }
            require.cache[dbModulePath].exports = bot.db;
            const parts = q.data.split(' ');
            const commandName = parts.shift().toLowerCase();
            const args = parts;
            const msg = q.message;
            msg.from = q.from;
            const command = bot.commands.get(commandName);
            if (command) {
                if (command.category === 'group' && msg.chat.type !== 'private') {
                    const userIsAdmin = await isChatAdmin(msg.chat, q.from.id);
                    if (!userIsAdmin) {
                        return bot.answerCallbackQuery(q.id, { text: 'Only group admins can use this button.', show_alert: true });
                    }
                }
                await bot.answerCallbackQuery(q.id);
                print.info(`[JADIBOT] Executing callback: ${command.name} | User: ${q.from.id}`);
                await command.execute(bot, msg, args);
            } else {
                await bot.answerCallbackQuery(q.id);
            }
        } catch (err) {
            print.error(err, '[JADIBOT] Callback Handler');
        } finally {
            if (originalDb) require.cache[dbModulePath].exports = originalDb;
        }
    });
    bot.on('message', async (msg) => {
        const originalDb = require.cache[dbModulePath]?.exports;
        try {
            if (!msg.chat || !msg.from) return;
            require.cache[dbModulePath].exports = bot.db;
            if (await bot.handleModeration(msg)) return;
            if (await helper.handleAntiSpam(bot, msg)) return;
            const botConfig = bot.db.getBotConfig();
            if (botConfig.botMode === 'self' && String(msg.from.id) !== String(ownerId)) {
                return;
            }
            const messageText = msg.text || msg.caption || '';
            const prefix = ['.', '/', 'liona'].find(p => messageText.startsWith(p));
            if (!prefix) return;
            const args = messageText.slice(prefix.length).trim().split(/\s+/);
            const commandName = args.shift()?.toLowerCase();
            const command = bot.commands.get(commandName);
            if (!command) return;
            if (command.name === 'jadibot') {
                return bot.sendMessage(msg.chat.id, "This command cannot be used by a jadibot instance.");
            }
            print.info(`[JADIBOT] Executing command: ${command.name} | User: ${msg.from.id}`);
            await command.execute(bot, msg, args);
        } catch (error) {
            print.error(error, `[JADIBOT] Command ${msg.text?.split(' ')[0]}`);
        } finally {
            if (originalDb) require.cache[dbModulePath].exports = originalDb;
        }
    });
    bot.on('new_chat_members', async (msg) => {
        const originalDb = require.cache[dbModulePath]?.exports;
        try {
            require.cache[dbModulePath].exports = bot.db;
            await helper.handleWelcome(bot, msg);
        } catch (e) {
            print.error(e, '[JADIBOT] Welcome Handler');
        } finally {
            if (originalDb) require.cache[dbModulePath].exports = originalDb;
        }
    });
    bot.on('left_chat_member', async (msg) => {
        const originalDb = require.cache[dbModulePath]?.exports;
        try {
            require.cache[dbModulePath].exports = bot.db;
            await helper.handleLeftChatMember(bot, msg);
        } catch (e) {
            print.error(e, '[JADIBOT] Left Chat Member Handler');
        } finally {
            if (originalDb) require.cache[dbModulePath].exports = originalDb;
        }
    });
    print.info(`Jadibot handler attached for owner ${ownerId}.`);
};