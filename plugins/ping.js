module.exports = {
  name: 'ping',
  aliases: [],
  category: 'main',
  description: 'Cek latency bot',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const start = Date.now();
    const sent = await bot.sendMessage(chatId, '🏓 Pinging...');
    const latency = Date.now() - start;
    await bot.editMessageText(`PONG! 🏓\nLatency: ${latency} ms`, {
      chat_id: chatId,
      message_id: sent.message_id,
    });
  }
};