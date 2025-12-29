const config = require('../config.js');

module.exports = {
    name: 'report',
    category: 'tools',
    description: 'Send a report to the bot owner.',
    async execute(bot, msg, args) {
        const { from, chat } = msg;
        const q = args.join(' ');

        if (!q) {
            return bot.sendMessage(chat.id, 'Please provide a message to report. Usage: .report <message>');
        }

        const pushName = from.first_name || from.username || 'Anonymous';
        const senderId = from.id;
        const senderUsername = from.username;

        const ownerReport = `👤 Nama : ${pushName}
` +
                            `🆔 Id Tele: ${senderUsername ? `t.me/${senderUsername}` : senderId}
` +
                            `📦 Laporan : ${q}`;

        const userConfirmation = `[√] Laporanmu telah berhasil dikirim
` +
                                 `[ ! ] Terima kasih atas kontribusimu dalam pengembangan bot

` +
                                 `> © ${config.botName}. All rights reserved.`;

        try {
            const ownerIds = Array.isArray(config.ownerId) ? config.ownerId : [config.ownerId];
            for (const ownerId of ownerIds) {
                await bot.sendMessage(ownerId, ownerReport);
            }
            await bot.sendMessage(chat.id, userConfirmation, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Report command error:', error);
            await bot.sendMessage(chat.id, '❌ Failed to send the report. Please try again later.');
        }
    }
};
