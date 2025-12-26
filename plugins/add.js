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
    name: 'add',
    category: 'group',
    description: 'Generate a one-time invite link to add a user.',
    async execute(bot, msg, args) {
        const { chat, from } = msg;
        if (chat.type === 'private') {
            return bot.sendMessage(chat.id, 'This command can only be used in groups.');
        }
        const userIsAdmin = await isChatAdmin(bot, chat, from.id);
        if (!userIsAdmin) {
            return bot.sendMessage(chat.id, 'Only group admins can use this command.');
        }
        try {
            const inviteLink = await bot.createChatInviteLink(chat.id, {
                expire_date: Date.now() / 1000 + 60, 
                member_limit: 1 
            });
            await bot.sendMessage(chat.id, `Here is a one-time invite link (expires in 1 minute):\n${inviteLink.invite_link}`);
        } catch (error) {
            await bot.sendMessage(chat.id, ` Failed to create invite link. Make sure I have the correct permissions. Error: ${error.message}`);
        }
    }
};