const TelegramBot = require('node-telegram-bot-api');
const config = require('../config.js');
const print = require('./print.js');

if (!config.token || config.token === 'YOUR_BOT_TOKEN') {
  print.error('Silakan isi token bot Anda di dalam file config.js');
  process.exit(1);
}

const bot = new TelegramBot(config.token, { polling: true });

bot.on('polling_error', (error) => {
    print.error(error.message, 'Polling Error');
    if (error.message.includes('Conflict')) {
        print.error('Conflict detected: Another instance of the bot is running. Terminating this instance.');
        process.exit(1);
    }
});

print.success('Bot Telegram berhasil diaktifkan...');

module.exports = bot;