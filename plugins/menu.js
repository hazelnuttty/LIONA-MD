const path = require('path');
const fs = require('fs');
const config = require('../config.js');
const print = require('../lib/print.js');

module.exports = {
  name: 'start',
  aliases: ['menu'],
  category: 'main',
  description: 'Menampilkan start bot',
  async execute(bot, msg) {
    const chatId = msg.chat.id;
    const mediaPath = path.join(__dirname, '../../media/image.jpg');
    const runtime = bot.runtime(); 
    const caption = `
\`\`\`
╔──═⊱ WELCOME ───═⬡
║⎔ Developer : @hazeloffc
║⎔ Bot Name  : ${config.botName || 'Telegram Bot'}
║⎔ Version   : 1.0
║⎔ Runtime   : ${runtime}
┗━━━━━━━━━━━━━━⬡⬡
\`\`\`
    `; 
    
    const inline_keyboard = [
      [
        { text: 'Start', callback_data: 'menubutton' }
      ],
      [
        { text: 'Channel WA', url: 'https://whatsapp.com/channel/0029VarFmXW4Spk7e033IG0W' }
      ],
      [
        { text: 'Developer', url: 'https://t.me/hazeloffc' },
        { text: 'Github', url: 'https://github.com/hazeloffc' }
      ]
    ];

    const options = {
      reply_markup: { inline_keyboard },
      parse_mode: 'Markdown'
    };

    try {
      if (fs.existsSync(mediaPath)) {
        await bot.sendPhoto(chatId, mediaPath, { caption, ...options });
      } else {
        await bot.sendMessage(chatId, caption, options);
      }
    } catch (e) {
      print.error(e, 'Start Command');
      await bot.sendMessage(chatId, caption, options);
    }
  }
};
