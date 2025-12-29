module.exports = {
  name: 'skoleai',
  aliases: ['ai'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const question = args.join(' ')
    if (!question) return bot.sendMessage(chatId, 'tanya apa saja')

    const res = await bot.skoleAI(question)
    bot.sendMessage(chatId, res)
  }
}