module.exports = {
  name: 'hadistdetail',
  aliases: ['detailhadist'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const url = args[0]
    if (!url) return bot.sendMessage(chatId, 'contoh: /hadistdetail https://www.hadits.id/...')

    const d = await bot.detailHadist(url)
    if (!d) return bot.sendMessage(chatId, 'detail tidak ditemukan')

    bot.sendMessage(
      chatId,
`${d.title}
Nomor: ${d.hadithNumber}

${d.haditsArab}`
    )
  }
}