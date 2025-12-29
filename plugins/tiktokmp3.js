module.exports = {
  name: 'tiktokmp3',
  aliases: ['ttmp3'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const url = args[0]
    if (!url) return bot.sendMessage(chatId, 'contoh: /tiktokmp3 link')

    const audio = await bot.tiktokmp3(url)
    if (!audio) return bot.sendMessage(chatId, 'gagal mengambil audio')

    bot.sendMessage(chatId, audio)
  }
}