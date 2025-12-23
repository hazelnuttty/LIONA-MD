const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../config.js');
const print = require('../lib/print.js');

module.exports = {
  name: 'sticker',
  aliases: ['stiker', 's'],
  category: 'tools',
  description: 'Mengubah gambar menjadi stiker',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    try {
      const photo = msg.reply_to_message?.photo?.pop();
      if (!photo) {
        return bot.sendMessage(chatId, `📸 Balas sebuah gambar dengan perintah ini untuk menjadikannya stiker.`);
      }

      await bot.sendMessage(chatId, '🖼️ Mohon tunggu, stiker sedang dibuat...');

      const file = await bot.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${config.token}/${file.file_path}`;
      
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const tempFile = path.join(tempDir, `temp_${Date.now()}.webp`);

      const res = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      await sharp(res.data).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toFile(tempFile);

      await bot.sendSticker(chatId, tempFile, { reply_to_message_id: msg.message_id });

      fs.unlinkSync(tempFile);
    } catch (e) {
      print.error(e, 'Sticker Command');
      bot.sendMessage(chatId, '❌ Gagal membuat stiker. Pastikan Anda membalas sebuah gambar.');
    }
  }
};