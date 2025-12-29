const axios = require('axios')
const print = require('../lib/print.js')
const config = require('../config.js')

module.exports = {
  name: 'claila',
  aliases: [],
  category: 'ai',
  description: 'AI Claila',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id

    try {
      const text = args.join(' ') || 'hai'
      const url = `${config.apiProvider}/ai/claila?text=${encodeURIComponent(text)};`

      const { data } = await axios.get(url)

      if (!data || data.status !== true || !data.result) {
        return bot.sendMessage(chatId, 'error')
      }

      await bot.sendMessage(chatId, data.result)

    } catch (e) {
      print.error(e, 'Claila Command')
      await bot.sendMessage(chatId, 'error')
    }
  }
}