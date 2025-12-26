const { exec } = require('child_process');
const { isOwner } = require('../lib/owner.js');

module.exports = {
  name: 'exec',
  aliases: ['shell', 'sh'],
  category: 'owner',
  async execute(bot, msg, args) {
    if (!isOwner(msg.from.id)) {
      return bot.sendMessage(msg.chat.id, 'Owner only.');
    }

    if (!args.length) {
      return bot.sendMessage(msg.chat.id, 'Command?');
    }

    const command = args.join(' ');
    exec(command, (error, stdout, stderr) => {
      let result = '';
      if (error) result += `Error: ${error.message}\n`;
      if (stderr) result += `Stderr: ${stderr}\n`;
      if (stdout) result += `Stdout: ${stdout}`;
      
      if (result.length > 4000) {
        result = result.slice(0, 4000) + '...';
      }

      bot.sendMessage(msg.chat.id, `Result:\n\`\`\`\n${result || 'No output'}\n\`\`\``, { parse_mode: 'Markdown' });
    });
  }
};