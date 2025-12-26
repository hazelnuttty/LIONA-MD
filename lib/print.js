const chalk = require('chalk');
const moment = require('moment');
const config = require('../config.js');

let botInstance;

const print = {
  init: (bot) => {
    botInstance = bot;
  },

  info: (msg) => {
    console.log(chalk.cyan(`[INFO] ${moment().format('HH:mm:ss')} - ${msg}`));
  },

  success: (msg) => {
    console.log(chalk.green(`[SUCCESS] ${moment().format('HH:mm:ss')} - ${msg}`));
  },

  warn: (msg) => {
    console.log(chalk.yellow(`[WARN] ${moment().format('HH:mm:ss')} - ${msg}`));
  },

  error: async (err, context = 'General') => {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const errorMessage = err.stack || err.message || String(err);
    
    console.error(chalk.red(`[ERROR] ${timestamp} [${context}] - ${errorMessage}`));

    if (botInstance && config.ownerId) {
      const ownerErrorMsg = `*🚨 Bot Error Occurred 🚨*

*Context:* ${context}
*Time:* ${timestamp}
*Error:*
\`\`\`
${errorMessage}
\`\`\`
`;
      try {
        const truncatedMsg = ownerErrorMsg.length > 4096 ? ownerErrorMsg.substring(0, 4090) + '...' : ownerErrorMsg;
        await botInstance.sendMessage(config.ownerId, truncatedMsg, { parse_mode: 'Markdown' });
      } catch (ownerErr) {
        console.error(chalk.red('❌ FATAL: Failed to send error message to owner.'), ownerErr);
      }
    }
  },
  
  userError: async (chatId, customMessage = '❌ Maaf, terjadi kesalahan internal. Owner telah diberitahu.') => {
      if (botInstance && chatId) {
          try {
              await botInstance.sendMessage(chatId, customMessage);
          } catch (userErr) {
              console.error(chalk.red('❌ FATAL: Failed to send user-facing error to chat ' + chatId + '.'), userErr);
          }
      }
  }
};

module.exports = print;