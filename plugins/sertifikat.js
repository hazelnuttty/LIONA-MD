const axios = require('axios')
const print = require('../lib/print.js')
const config = require('../config.js')

module.exports = {
  name: 'sertifikatolol',
  aliases: [],
  category: 'canvas',
  description: 'Canvas Sertifikat Olol',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id

    try {
      const text = args.join(' ') || 'hai'
      const url = `${config.apiProvider}/canvas/sertifikatolol?text=${encodeURIComponent(text)}`

      const res = await axios.get(url, {
        responseType: 'arraybuffer'
      })

      if (!res.data) {
        return bot.sendMessage(chatId, 'error')
      }

      await bot.sendPhoto(
        chatId,
        Buffer.from(res.data),
        { caption: 'hasil canvas' }
      )

    } catch (e) {
      print.error(e, 'Canvas SertifikatOlol Command')
      await bot.sendMessage(chatId, 'error')
    }
  }
}