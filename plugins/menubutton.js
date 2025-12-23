const path = require('path');
const fs = require('fs');
const config = require('../config.js');
const print = require('../lib/print.js');

module.exports = {
  name: 'menubutton',
  aliases: ['menubutton'],
  category: 'main',
  description: 'Menampilkan menu utama bot dengan tombol dinamis',
  async execute(bot, msg) {
    const chatId = msg.chat.id;
    const mediaPath = path.join(__dirname, '../../media/image.jpg');
    const runtime = bot.runtime();
    const caption = `
\`\`\`
╔─═⊱ MENU BUTTON ─═⬡
║⎔ Developer : @hazeloffc
║⎔ Bot Name  : ${config.botName}
║⎔ Version   : 1.0
║⎔ Runtime   : ${runtime}
┗━━━━━━━━━━━━━⬡⬡
\`\`\`
`;

    const commands = bot.commands;
    const categories = {};
    const seenCommands = new Set();
    commands.forEach(cmd => {
      if (!cmd.category || cmd.category === 'owner' || seenCommands.has(cmd.name)) {
        return;
      }
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(cmd);
      seenCommands.add(cmd.name);
    });

    const inline_keyboard = [];
    const sortedCategories = Object.keys(categories).sort();

    for (const category of sortedCategories) {
        const buttons = categories[category].map(cmd => ({
            text: cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1),
            callback_data: cmd.name
        }));

        for (let i = 0; i < buttons.length; i += 2) {
            inline_keyboard.push(buttons.slice(i, i + 2));
        }
    }

    inline_keyboard.push(
        [{ text: 'Channel WA', url: 'https://whatsapp.com/channel/0029Vb4HHTJFCCoYgkMjn93K' }],
        [{ text: 'Developer', url: 'https://t.me/hazeloffc' }, { text: 'Github', url: 'https://github.com/hazelnuttty' }]
    );
    const buttons = {
      reply_markup: { inline_keyboard },
      parse_mode: 'Markdown'
    };

    try {
      if (fs.existsSync(mediaPath)) {
        await bot.sendPhoto(chatId, mediaPath, { caption, ...buttons });
      } else {
        await bot.sendMessage(chatId, caption, buttons);
      }
    } catch (e) {
      print.error(e, 'Menu Button Command');
      await bot.sendMessage(chatId, caption, buttons);
    }
  }
};