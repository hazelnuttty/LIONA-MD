module.exports = {
  name: 'jadwal',
  aliases: ['jadwalsholat'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const query = args.join(' ')
    if (!query) return bot.sendMessage(chatId, 'contoh: /jadwal depok')

    const city = await bot.searchPrayerCity(query)
    if (!city) return bot.sendMessage(chatId, 'kota tidak ditemukan')

    const schedule = await bot.getPrayerSchedule(city.id)
    if (!schedule) return bot.sendMessage(chatId, 'jadwal tidak ditemukan')

    bot.sendMessage(
      chatId,
`Jadwal Sholat ${schedule.kota}

Imsak   : ${schedule.jadwal.imsyak}
Subuh   : ${schedule.jadwal.shubuh}
Dzuhur  : ${schedule.jadwal.dzuhur}
Ashar   : ${schedule.jadwal.ashr}
Maghrib : ${schedule.jadwal.maghrib}
Isya    : ${schedule.jadwal.isya}`
    )
  }
}