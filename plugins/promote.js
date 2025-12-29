module.exports = {
    name: 'promote',
    category: 'group',
    description: 'Promote a user to admin.',
    async execute(bot, msg, args) {
        const { chat, from, reply_to_message } = msg;

        if (chat.type === 'private') {
            return bot.sendMessage(chat.id, 'This command can only be used in groups.');
        }

        try {
            const botMember = await bot.getChatMember(chat.id, bot.id);
            if (!botMember.can_promote_members) { 
                return bot.sendMessage(chat.id, "❌ I don't have permission to promote members. Make me admin with 'can_promote_members'.");
            }

            const admin = await bot.getChatMember(chat.id, from.id);
            if (!['creator', 'administrator'].includes(admin.status)) {
                return bot.sendMessage(chat.id, '❌ Only admins can use this command.');
            }
            if (!admin.can_promote_members) {
                return bot.sendMessage(chat.id, "❌ You don't have permission to promote members.");
            }

            let targetId;
            let targetUsername;

            if (reply_to_message) {
                targetId = reply_to_message.from.id;
                targetUsername = reply_to_message.from.username ? `@${reply_to_message.from.username}` : reply_to_message.from.first_name;
            } else if (args.length > 0 && /^\d+$/.test(args[0])) {
                targetId = parseInt(args[0], 10);
                try {
                    const member = await bot.getChatMember(chat.id, targetId);
                    targetUsername = member.user.username || member.user.first_name;
                } catch {
                    return bot.sendMessage(chat.id, '❌ Could not find a user with that ID in this group.');
                }
            } else {
                return bot.sendMessage(chat.id, '❌ Please reply to the user or provide a valid numeric user ID.');
            }

            const targetMember = await bot.getChatMember(chat.id, targetId);
            if (targetMember.status === 'creator') {
                return bot.sendMessage(chat.id, '❌ Cannot promote the group creator.');
            }

            await bot.promoteChatMember(chat.id, targetId, {
                can_change_info: true,
                can_post_messages: true,
                can_edit_messages: true,
                can_delete_messages: true,
                can_invite_users: true,
                can_restrict_members: true,
                can_pin_messages: true,
                can_promote_members: false,
                is_anonymous: false,
                can_manage_chat: true,
                can_manage_video_chats: true,
                can_manage_voice_chats: true
            });

            await bot.sendMessage(chat.id, `✅ Successfully promoted ${targetUsername} to admin.`);
            await bot.sendMessage(chat.id, `🔔 Notifikasi: ${targetUsername} telah menjadi admin.`);

        } catch (error) {
            await bot.sendMessage(chat.id, `❌ Failed to promote user. Error: ${error.message}`);
        }
    }
};