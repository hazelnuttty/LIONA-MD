module.exports = {
  name: 'im',
  aliases: ['info', 'whois'],
  category: 'tools',
  description: 'Cek info akun Telegram',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;

    let targetUser = null;
    let sourceMsgId = msg.message_id;

    if (msg.reply_to_message) {
      targetUser = msg.reply_to_message.from;
      sourceMsgId = msg.reply_to_message.message_id;
    }

    else if (msg.entities) {
      const mention = msg.entities.find(e => e.type === 'mention');
      if (mention) {
        const username = msg.text.substr(mention.offset + 1, mention.length - 1);
        try {
          const chat = await bot.getChat(`@${username}`);
          targetUser = chat;
        } catch {
          return bot.sendMessage(chatId, '❌ user tidak ditemukan 😢');
        }
      }
    }

    if (!targetUser) {
      targetUser = msg.from;
    }

    let isAdmin = 'tidak';
    if (msg.chat.type !== 'private') {
      try {
        const admins = await bot.getChatAdministrators(chatId);
        if (admins.some(a => a.user.id === targetUser.id)) {
          isAdmin = 'ya';
        }
      } catch {}
    }

    const info = `
👤 <b>account</b>
<blockquote><pre>
name  : ${targetUser.first_name || targetUser.title || '-'}
id    : ${targetUser.id}
uname : ${targetUser.username ? '@' + targetUser.username : '-'}
type  : ${msg.chat.type}
admin : ${isAdmin}
</pre></blockquote>

✉️ <b>message</b>
<blockquote><pre>
id    : ${sourceMsgId}
date  : ${new Date(msg.date * 1000).toLocaleString('id-ID')}
</pre></blockquote>
    `.trim();

    await bot.sendMessage(chatId, info, {
      reply_to_message_id: sourceMsgId,
      parse_mode: 'HTML'
    });
  }
};