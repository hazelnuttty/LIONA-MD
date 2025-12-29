const chalk = require('chalk');
const moment = require('moment');
const config = require('../config.js');

let botInstance;

const getOwnerId = () => {
  if (!config.ownerId) return null;
  return Array.isArray(config.ownerId)
    ? config.ownerId[0]
    : config.ownerId;
};

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
    const errorMessage = err?.stack || err?.message || String(err);

    console.error(
      chalk.red(`[ERROR] ${timestamp} [${context}] - ${errorMessage}`)
    );

    const ownerId = getOwnerId();
    if (!botInstance || !ownerId) return;

    const ownerErrorMsg = `*🚨 Bot Error Occurred 🚨*

*Context:* ${context}
*Time:* ${timestamp}
*Error:*
\`\`\`
${errorMessage}
\`\`\`
`;

    try {
      const truncatedMsg =
        ownerErrorMsg.length > 4096
          ? ownerErrorMsg.slice(0, 4090) + '...'
          : ownerErrorMsg;

      await botInstance.sendMessage(
        String(ownerId),
        truncatedMsg,
        { parse_mode: 'Markdown' }
      );
    } catch (ownerErr) {
      console.error(
        chalk.red('❌ FATAL: Failed to send error message to owner.'),
        ownerErr.message
      );
    }
  },

  userError: async (chatId, message = '❌ Terjadi kesalahan internal.') => {
    if (!botInstance || !chatId) return;
    try {
      await botInstance.sendMessage(String(chatId), message);
    } catch (e) {
      console.error(
        chalk.red(`❌ Failed to send user error to ${chatId}`),
        e.message
      );
    }
  }
};

module.exports = print;