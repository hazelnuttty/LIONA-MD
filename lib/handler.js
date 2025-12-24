const print = require('./print');
const db = require('./database.js');
const config = require('../config.js');

async function isChatAdmin(bot, chat, userId) {
    if (chat.type === 'private' || userId === config.ownerId) return true;
    try {
        const admins = await bot.getChatAdministrators(chat.id);
        return admins.some(admin => admin.user.id === userId);
    } catch (error) {
        print.error(error, `isChatAdmin check for chat ${chat.id}`);
        return false;
    }
}

async function handleModeration(bot, msg) {
    const { chat, from, message_id, text, caption, photo, entities } = msg;
    if (!chat || !from) return false;

    try {
        const chatConfig = db.getChatConfig(chat.id);
        const username = from.username ? `@${from.username}` : from.first_name;
        const chatType = chat.type === 'private' ? 'private chat' : 'group';

        const userIsAdmin = await isChatAdmin(bot, chat, from.id);

        if (from.id === config.ownerId) {
            if ((chatConfig.antiImage && photo) || 
                (chatConfig.antiLink && 
                    ((entities && entities.some(e => e.type === 'url' || e.type === 'text_link')) || 
                     (text && /https?:\/\/\S+/.test(text)) || 
                     (caption && /https?:\/\/\S+/.test(caption)))
                )
            ) {
                await bot.sendMessage(chat.id, `${username}, anda adalah owner, saya tidak dapat menghapus.`);
            }
            return false;
        }

        if (userIsAdmin) {
            if ((chatConfig.antiImage && photo) || 
                (chatConfig.antiLink && 
                    ((entities && entities.some(e => e.type === 'url' || e.type === 'text_link')) || 
                     (text && /https?:\/\/\S+/.test(text)) || 
                     (caption && /https?:\/\/\S+/.test(caption)))
                )
            ) {
                await bot.sendMessage(chat.id, `${username}, anda adalah admin, saya tidak dapat menghapus.`);
            }
            return false;
        }

        if (chatConfig.antiImage && photo) {
            await bot.deleteMessage(chat.id, message_id);
            await bot.sendMessage(chat.id, `${username}, ${chatType} ini menyalakan anti-image.`);
            print.info(`[MOD] Deleted image from ${from.username || from.id} in ${chat.title || chat.id}`);
            return true;
        }

        if (chatConfig.antiLink) {
            const hasLink = (entities && entities.some(e => e.type === 'url' || e.type === 'text_link')) ||
                            (text && /https?:\/\/\S+/.test(text)) ||
                            (caption && /https?:\/\/\S+/.test(caption));
            if (hasLink) {
                await bot.deleteMessage(chat.id, message_id);
                await bot.sendMessage(chat.id, `${username}, ${chatType} ini menyalakan anti-link.`);
                print.info(`[MOD] Deleted link from ${from.username || from.id} in ${chat.title || chat.id}`);
                return true;
            }
        }

    } catch (error) {
        print.error(error, 'Moderation System');
    }

    return false;
}

module.exports = (bot) => {
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
  
  bot.on('callback_query', async (q) => {
    try {
      const parts = q.data.split(' ');
      const commandName = parts.shift().toLowerCase();
      const args = parts;
      const msg = q.message;

      await bot.answerCallbackQuery(q.id);

      const command = bot.commands.get(commandName);

      if (command) {
        print.info(`Executing callback command: ${command.name} | User: ${q.from.username || q.from.id}`);
        await command.execute(bot, msg, args);
      } else {
        print.warn(`Callback data diterima, tapi bukan perintah: ${commandName}`);
      }
    } catch (err) {
      print.error(err, 'Callback Handler');
      await bot.sendMessage(q.message.chat.id, '❌ Terjadi kesalahan saat memproses tombol.');
    }
  });

  bot.handleModeration = (msg) => handleModeration(bot, msg);
};
