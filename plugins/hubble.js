module.exports = {
  name: 'hubble',
  aliases: ['nasa'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const query = args.join(' ')
    if (!query) return bot.sendMessage(chatId, 'contoh: /hubble galaxy')

    const res = await bot.hubbleSearch(query)
    if (!res || !res.data)
      return bot.sendMessage(chatId, 'data tidak ditemukan')

    const d = res.data.detail

    bot.sendMessage(
      chatId,
`${d.title}

${d.description}

Image: ${d.fullImage}`
    )
  }
}