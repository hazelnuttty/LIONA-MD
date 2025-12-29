const { isOwner } = require('../lib/owner.js');
const config = require('../config.js');

module.exports = {
  name: 'eval',
  aliases: ['ev'],
  category: 'owner',
  async execute(bot, msg, args) {
    if (!isOwner(msg.from.id)) {
      return bot.sendMessage(msg.chat.id, 'Owner only.');
    }

    if (!args.length) {
      return bot.sendMessage(msg.chat.id, 'Kode?');
    }

    try {
      const code = args.join(' ');
      const db = bot.db; 

      let result = await (async (bot, msg, args, config, db) => {
        return await eval(code);
      })(bot, msg, args, config, db);

      if (result && typeof result.then === 'function') {
        result = await result;
      }

      let output = result;
      if (typeof result === 'object') {
        output = JSON.stringify(result, null, 2);
      }

      const escapedOutput = output.replace(/`/g, '\\`');

      return bot.sendMessage(
        msg.chat.id,
        `Result:\n\`\`\`javascript\n${escapedOutput}\n\`\`\``,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      const escapedError = error.toString().replace(/`/g, '\\`');
      return bot.sendMessage(
        msg.chat.id,
        `Error:\n\`\`\`javascript\n${escapedError}\n\`\`\``,
        { parse_mode: 'Markdown' }
      );
    }
  }
};