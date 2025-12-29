const db = require('../lib/database.js');
const { isOwner } = require('../lib/owner.js');

module.exports = {
    name: 'unban',
    category: 'owner',
    description: 'Unban a user or group.',
    async execute(bot, msg, args) {
        const { chat, from, reply_to_message } = msg;

        if (!isOwner(from.id)) {
            return bot.sendMessage(chat.id, 'This command is for the owner only.');
        }

        let targetId;
        let targetType;

        if (reply_to_message) {
            targetId = reply_to_message.from.id;
            targetType = 'User';
        }
        else if (args[0]) {
            targetId = args[0].replace('@', '');
            if (!isNaN(targetId)) {
                 targetId = parseInt(targetId);
            } else {
                return bot.sendMessage(chat.id, 'Unbanning by username is not supported. Please reply to a user or provide their numeric ID.');
            }
            targetType = 'User';
        }
        else {
            targetId = chat.id;
            targetType = 'Group';
        }

        if (!db.isBanned(targetId)) {
            return bot.sendMessage(chat.id, `${targetType} with ID ${targetId} is not currently banned.`);
        }

        db.removeBan(targetId);
        await bot.sendMessage(chat.id, `Successfully unbanned ${targetType} with ID: ${targetId}`);
    }
};
