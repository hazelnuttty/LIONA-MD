module.exports = {
  name: 'hadist',
  aliases: ['hadits'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const query = args.join(' ')
    if (!query) return bot.sendMessage(chatId, 'contoh: /hadist sabar')

    const res = await bot.hadist(query)
    if (!res || res.length === 0)
      return bot.sendMessage(chatId, 'hadist tidak ditemukan')

    let text = `Hasil hadist tentang ${query}\n\n`
    res.slice(0, 5).forEach((h, i) => {
      text += `${i + 1}. ${h.judul}\nPerawi: ${h.perawi}\nLink: ${h.link}\n\n`
    })

    bot.sendMessage(chatId, text.trim())
  }
}