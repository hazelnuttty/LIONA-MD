const fs = require('fs')
const path = require('path')
const config = require('../config.js')

module.exports = {
  name: 'plugins',
  aliases: ['plugin'],
  category: 'owner',
  description: 'Add / Delete / Get plugin',
  async execute(bot, msg, args) {
    if (msg.from.id !== config.ownerId) {
      return bot.sendMessage(msg.chat.id, 'Owner only.')
    }

    const chatId = msg.chat.id
    const pluginsDir = __dirname

    if (!args.length)
      return bot.sendMessage(chatId,
`contoh:
• /plugins --add example.js (reply kode)
• /plugins --del example.js
• /plugins --get example.js`
      )

    const flag = args[0]
    const fileArg = args[1]

    if (!fileArg)
      return bot.sendMessage(chatId, 'nama file plugin mana 😿')

    const fileName = fileArg.endsWith('.js') ? fileArg : `${fileArg}.js`
    const filePath = path.join(pluginsDir, fileName)

    if (flag === '--add') {
      if (!msg.reply_to_message || !msg.reply_to_message.text)
        return bot.sendMessage(chatId, 'reply pesan berisi kode plugin 😭')

      const code = msg.reply_to_message.text.trim()
      if (!code)
        return bot.sendMessage(chatId, 'kodenya kosong 😿')

      await bot.sendChatAction(chatId, 'typing')

      setTimeout(() => {
        fs.writeFileSync(filePath, code)
        delete require.cache[require.resolve(filePath)]
        const plugin = require(filePath)
        if (plugin?.name) bot.commands.set(plugin.name, plugin)

        bot.sendMessage(
          chatId,
          `> /plugins --add ${fileName}\n\nplugin *${fileName}* berhasil ditambahkan 💖`,
          { parse_mode: 'Markdown' }
        )
      }, 1200)

      return
    }

    if (flag === '--del') {
      if (!fs.existsSync(filePath))
        return bot.sendMessage(chatId, 'plugin tidak ditemukan 😿')

      fs.unlinkSync(filePath)

      return bot.sendMessage(
        chatId,
        `plugin *${fileName}* berhasil dihapus 🗑️`,
        { parse_mode: 'Markdown' }
      )
    }

    if (flag === '--get') {
      if (!fs.existsSync(filePath))
        return bot.sendMessage(chatId, 'plugin tidak ditemukan 😿')

      return bot.sendDocument(chatId, filePath, {
        caption: `nih plugin *${fileName}* 😼`,
        parse_mode: 'Markdown'
      })
    }

    return bot.sendMessage(chatId, 'flag tidak dikenal 😵\npakai: --add | --del | --get')
  }
}