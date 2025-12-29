module.exports = {
  name: 'donghua',
  aliases: ['donghuaschedule'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const day = (args[0] || '').toLowerCase()

    const data = await bot.donghuaSchedule()
    if (!data || !data.results) return bot.sendMessage(chatId, 'gagal mengambil data')

    if (!day) {
      return bot.sendMessage(
        chatId,
`Total donghua: ${data.totalDonghua}
Hari tersedia:
${Object.values(data.days).join(', ')}

contoh: /donghua monday`
      )
    }

    const list = data.results[day]
    if (!list || list.length === 0)
      return bot.sendMessage(chatId, 'tidak ada donghua di hari tersebut')

    let text = `Donghua hari ${data.days[day]}\n\n`
    for (const d of list) {
      text += `${d.title}\nEpisode: ${d.episode}\nStatus: ${d.status}\n\n`
    }

    bot.sendMessage(chatId, text.trim())
  }
}