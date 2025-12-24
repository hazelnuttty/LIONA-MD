const db = require('../lib/database.js');
const config = require('../config.js');

module.exports = {
  name: 'antilink',
  category: 'owner',
  description: 'Enable or disable anti-link feature for this chat.',
  async execute(bot, msg, args) {
    const { chat, from } = msg;

    if (from.id !== config.ownerId) {
      return bot.sendMessage(chat.id, 'This command is for the owner only.');
    }

    const option = args[0]?.toLowerCase();
    if (option !== 'on' && option !== 'off') {
      return bot.sendMessage(chat.id, 'Usage: /antilink <on|off>');
    }

    const chatConfig = db.getChatConfig(chat.id);
    chatConfig.antiLink = (option === 'on');
    db.updateChatConfig(chat.id, chatConfig);

    await bot.sendMessage(chat.id, `Anti-link feature has been turned ${option} for this chat.`);
  }
};
