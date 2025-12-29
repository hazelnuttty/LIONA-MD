const os = require('os');
const config = require('../config.js');
const print = require('../lib/print.js');

module.exports = {
  name: 'runtime',
  aliases: ['uptime'],
  category: 'tools',
  description: 'Menampilkan status dan uptime bot',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((uptime % (60 * 60)) / 60);
      const seconds = Math.floor(uptime % 60);

      const runtimeText = `🤖 *BOT STATUS*

🕒 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
💾 *Platform:* ${os.platform()}
⚙️ *CPU:* ${os.cpus()[0].model}
📈 *RAM:* ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB Total
🧠 *Free RAM:* ${(os.freemem() / 1024 / 1024).toFixed(2)} MB

© ${config.botName}`;

      await bot.sendMessage(chatId, runtimeText, { parse_mode: 'Markdown' });
    } catch (e) {
      print.error(e, 'Runtime Command');
      bot.sendMessage(chatId, '❌ Gagal menampilkan runtime bot.');
    }
  }
};