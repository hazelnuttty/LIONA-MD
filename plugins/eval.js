const config = require('../config.js');

module.exports = {
  name: 'eval',
  aliases: ['ev'],
  category: 'owner',
  async execute(bot, msg, args) {
    if (msg.from.id !== config.ownerId) {
      return bot.sendMessage(msg.chat.id, 'Owner only.');
    }

    if (!args.length) {
      return bot.sendMessage(msg.chat.id, 'Kode?');
    }

    try {
      const code = args.join(' ');
      let result = eval(code);
      
      if (result && typeof result.then === 'function') {
        result = await result;
      }

      let output = result;
      if (typeof result === 'object') {
        output = JSON.stringify(result, null, 2);
      }

      return bot.sendMessage(msg.chat.id, `Result:\n\`\`\`javascript\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch (error) {
      return bot.sendMessage(msg.chat.id, `Error:\n\`\`\`javascript\n${error}\n\`\`\``, { parse_mode: 'Markdown' });
    }
  }
};