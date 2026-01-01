const axios = require('axios')
const print = require('../lib/print.js')

module.exports = {
  name: 'brat',
  aliases: ['bratvid'],
  category: 'maker',
  description: 'Membuat brat image atau gif dari text',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    try {
      const text = args.join(' ')
      if (!text) {
        return bot.sendMessage(chatId, 'contoh: /brat halo dunia')
      }

      const command = msg.text.split(' ')[0].replace('/', '')
      let url

      switch (command) {
        case 'brat':
          url = `https://brat.siputzx.my.id/image?text=${encodeURIComponent(text)}`
          break
        case 'bratvid':
          url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text)}`
          break
        default:
          return bot.sendMessage(chatId, 'command tidak dikenali')
      }

      const res = await axios.get(url, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(res.data)

      if (command === 'bratvid') {
        await bot.sendAnimation(chatId, buffer, {
          reply_to_message_id: msg.message_id
        })
      } else {
        await bot.sendPhoto(chatId, buffer, {
          reply_to_message_id: msg.message_id
        })
      }

    } catch (e) {
      print.error(e, 'Brat Command')
      bot.sendMessage(chatId, 'gagal membuat brat')
    }
  }
}