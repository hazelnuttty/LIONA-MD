const fs = require('fs');
const path = require('path');
const config = require('../config.js');
const print = require('../lib/print.js');

module.exports = {
  name: 'setmode',
  aliases: ['mode'],
  category: 'owner',
  description: 'Mengubah mode bot (public/self).',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;

    if (msg.from.id !== config.ownerId) {
      return bot.sendMessage(chatId, '❌ Perintah ini hanya untuk Owner Bot.');
    }

    const newMode = args[0]?.toLowerCase();
    if (!newMode || !['public', 'self'].includes(newMode)) {
      return bot.sendMessage(chatId, `Gunakan: \
/setmode <public|self>\
Mode saat ini: *${config.botMode}*`, { parse_mode: 'Markdown' });
    }

    if (newMode === config.botMode) {
        return bot.sendMessage(chatId, `✅ Bot sudah dalam mode *${newMode}*. Tidak ada yang diubah.`, { parse_mode: 'Markdown' });
    }

    config.botMode = newMode;

    const configPath = path.join(__dirname, '../../config.js');
    try {
      let configData = fs.readFileSync(configPath, 'utf8');
      configData = configData.replace(/botMode:\s*['"](public|self)['"]/, `botMode: '${newMode}'`);
      fs.writeFileSync(configPath, configData, 'utf8');
      
      print.info(`Mode bot diubah menjadi: ${newMode}`);
      await bot.sendMessage(chatId, `✅ Mode bot berhasil diubah ke *${newMode}*.`, { parse_mode: 'Markdown' });
    } catch (error) {
      print.error(error, 'Setmode');
      await bot.sendMessage(chatId, '❌ Gagal menyimpan perubahan mode ke file konfigurasi.');
    }
  }
};