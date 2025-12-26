const config = require('../config.js');

module.exports = {
    name: 'cekowner',
    category: 'owner',
    description: 'Melihat daftar owner bot.',
    async execute(bot, msg) {
        const { chat } = msg;

        const ownerIds = Array.isArray(config.ownerId)
            ? config.ownerId
            : [config.ownerId];

        if (!ownerIds.length) {
            return bot.sendMessage(chat.id, 'Owner belum diset.');
        }

        let text = 'Daftar Owner Bot\n\n';
        ownerIds.forEach((id, index) => {
            text += `${index + 1}. ${id}\n`;
        });

        await bot.sendMessage(chat.id, text);
    }
};