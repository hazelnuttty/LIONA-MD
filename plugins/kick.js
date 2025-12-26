const { isOwner } = require('../lib/owner.js');

async function isChatAdmin(bot, chat, userId) {
    if (isOwner(userId)) return true;
    try {
        const admins = await bot.getChatAdministrators(chat.id);
        return admins.some(admin => admin.user.id === userId);
    } catch (error) {
        return false;
    }
}

module.exports = {
    name: 'kick',
    category: 'group',
    description: 'Kick a user from the group.',
    async execute(bot, msg, args) {
        const { chat, from, reply_to_message } = msg;

        if (chat.type === 'private') {
            return bot.sendMessage(chat.id, 'This command can only be used in groups.');
        }

        const userIsAdmin = await isChatAdmin(bot, chat, from.id);
        if (!userIsAdmin) {
            return bot.sendMessage(chat.id, 'Only group admins can use this command.');
        }

        if (!reply_to_message) {
            return bot.sendMessage(chat.id, 'Please reply to the user you want to kick.');
        }

        const targetId = reply_to_message.from.id;
        const targetUsername = reply_to_message.from.username ? `@${reply_to_message.from.username}` : reply_to_message.from.first_name;

        try {
            await bot.banChatMember(chat.id, targetId);
            await bot.unbanChatMember(chat.id, targetId);
            await bot.sendMessage(chat.id, `Successfully kicked ${targetUsername}.`);
        } catch (error) {
            await bot.sendMessage(chat.id, `Failed to kick user. Error: ${error.message}`);
        }
    }
};
