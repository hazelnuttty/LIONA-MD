const fs = require('fs');
const path = require('path');
const mainConfig = require('../config.js');
const print = require('../lib/print.js');
const { isOwner } = require('../lib/owner.js');

module.exports = {
  name: 'setmode',
  aliases: ['mode'],
  category: 'owner',
  description: 'Changes the bot mode (public/self). Can be used by jadibot owners.',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const isJadibot = !!bot.isJadibot;
    
    const ownerId = isJadibot ? bot.ownerId : null;

    if (isJadibot) {
        if (String(msg.from.id) !== String(ownerId)) {
            return bot.sendMessage(chatId, 'This command is for the Owner of this jadibot only.');
        }
    } else {
        if (!isOwner(msg.from.id)) {
            return bot.sendMessage(chatId, 'This command is for the main bot owner only.');
        }
    }

    const newMode = args[0]?.toLowerCase();
    
    if (isJadibot) {
        const botConfig = bot.db.getBotConfig();
        if (!newMode || !['public', 'self'].includes(newMode)) {
            return bot.sendMessage(chatId, `Usage: /setmode <public|self>\nCurrent jadibot mode: *${botConfig.botMode}*`, { parse_mode: 'Markdown' });
        }
        if (newMode === botConfig.botMode) {
            return bot.sendMessage(chatId, `Jadibot is already in *${newMode}* mode.`, { parse_mode: 'Markdown' });
        }
        bot.db.updateBotConfig({ botMode: newMode });
        print.info(`Jadibot mode changed to: ${newMode} for owner ${ownerId}`);
        await bot.sendMessage(chatId, `Jadibot mode successfully changed to *${newMode}*.`, { parse_mode: 'Markdown' });
    } else {
        if (!newMode || !['public', 'self'].includes(newMode)) {
            return bot.sendMessage(chatId, `Usage: /setmode <public|self>\nCurrent mode: *${mainConfig.botMode}*`, { parse_mode: 'Markdown' });
        }
        if (newMode === mainConfig.botMode) {
            return bot.sendMessage(chatId, `Main bot is already in *${newMode}* mode.`, { parse_mode: 'Markdown' });
        }

        mainConfig.botMode = newMode; 
        const configPath = path.resolve(__dirname, '../config.js');
        try {
          let configData = fs.readFileSync(configPath, 'utf8');
          configData = configData.replace(/botMode:\s*['"](public|self)['"]/, `botMode: '${newMode}'`);
          fs.writeFileSync(configPath, configData, 'utf8');
          
          print.info(`Main bot mode changed to: ${newMode}`);
          await bot.sendMessage(chatId, `Main bot mode successfully changed to *${newMode}*.`, { parse_mode: 'Markdown' });
        } catch (error) {
          print.error(error, 'Setmode');
          await bot.sendMessage(chatId, 'Failed to save mode change to config file.');
        }
    }
  }
};
