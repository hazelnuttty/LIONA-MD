const axios = require('axios');
const print = require('../lib/print.js');
const config = require('../config.js');

module.exports = {
  name: 'shion',
  aliases: [],
  category: 'ai',
  description: 'AI Shion',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;

    try {
      const text = args.join(' ') || 'hai';
      const url = `${config.apiProvider}/ai/shion?text=${encodeURIComponent(text)}`;

      const res = await axios.get(url);
      const data = res.data;

      if (!data || !data.status || !data.result?.content) {
        return bot.sendMessage(chatId, 'error');
      }

      await bot.sendMessage(chatId, data.result.content, {
        parse_mode: 'Markdown'
      });

    } catch (e) {
      print.error(e, 'Shion Command');
      await bot.sendMessage(chatId, 'error');
    }
  }
};