const path = require('path');
const fs = require('fs');
const config = require('../config.js');
const print = require('../lib/print.js');

const ITEMS_PER_PAGE = 6;

function generateMenu(page, commands) {
    const commandList = [];
    const seenCommands = new Set();

    commands.forEach(cmd => {
        if (!cmd.category || cmd.category === 'owner' || seenCommands.has(cmd.name)) {
            return;
        }
        commandList.push(cmd);
        seenCommands.add(cmd.name);
    });

    const totalPages = Math.ceil(commandList.length / ITEMS_PER_PAGE);
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));
    
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageCommands = commandList.slice(startIndex, endIndex);

    const inline_keyboard = [];
    for (let i = 0; i < pageCommands.length; i += 3) {
        inline_keyboard.push(pageCommands.slice(i, i + 3).map(cmd => ({
            text: cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1),
            callback_data: cmd.name
        })));
    }

    const nav_buttons = [];
    if (currentPage > 0) {
        nav_buttons.push({ text: 'Back', callback_data: `menubutton ${currentPage - 1}` });
    }
    if (currentPage < totalPages - 1) {
        nav_buttons.push({ text: 'Next', callback_data: `menubutton ${currentPage + 1}` });
    }

    if (nav_buttons.length > 0) {
        inline_keyboard.push(nav_buttons);
    }
    
    inline_keyboard.push(
        [{ text: 'Developer', url: 'https://t.me/hazeloffc' }, { text: 'Github', url: 'https://github.com/hazelnuttty' }]
    );

    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const caption = `
\`\`\`
[${time}] LIONA-MD
───────────────
NAME : ${config.botName}
VERSION : ${config.botVersion}
PAGE : ${currentPage + 1} / ${totalPages}
───────────────
SELECT BUTTON
\`\`\`
    `;

    return { caption, inline_keyboard };
}

module.exports = {
  name: 'menubutton',
  aliases: ['menubutton'],
  category: 'main',
  description: 'Displays the main menu with paginated buttons.',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const page = args[0] ? parseInt(args[0], 10) : 0;

    const { caption, inline_keyboard } = generateMenu(page, bot.commands);
    
    const options = {
      chat_id: chatId,
      message_id: msg.message_id,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard }
    };

    try {
        // If args has page number, it's a callback, so edit the message
        if (args.length > 0) {
            if (msg.photo) {
                await bot.editMessageCaption(caption, options);
            } else {
                await bot.editMessageText(caption, options);
            }
        } else {
            // Otherwise, it's a new command, send a new message
            const mediaPath = path.join(__dirname, '../media/image.jpg');
            if (fs.existsSync(mediaPath)) {
                await bot.sendPhoto(chatId, mediaPath, { caption, ...options });
            } else {
                await bot.sendMessage(chatId, caption, options);
            }
        }
    } catch (e) {
      print.error(e, 'Menu Button Command');
      // Fallback to sending a new message if editing fails
      if (args.length > 0) {
          await bot.sendMessage(chatId, caption, options);
      }
    }
  }
};
