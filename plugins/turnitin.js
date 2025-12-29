module.exports = {
  name: 'turnitin',
  aliases: ['plagiasi'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const text = args.join(' ')
    if (!text) return bot.sendMessage(chatId, 'masukkan teks')

    const score = await bot.turnitin(text)
    bot.sendMessage(chatId, `hasil kemiripan: ${score}%`)
  }
}