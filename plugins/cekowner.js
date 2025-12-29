const config = require('../config.js');
const { isOwner } = require('../lib/owner.js');

module.exports = {
    name: 'cekowner',
    category: 'owner',
    description: 'Melihat daftar owner bot.',
    async execute(bot, msg) {
        if (!isOwner(msg.from.id)) {
            return bot.sendMessage(msg.chat.id, 'This command is for owners only.');
        }
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