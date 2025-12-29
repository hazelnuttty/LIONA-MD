module.exports = {
    name: 'demote',
    category: 'group',
    description: 'Demote a user from admin.',
    async execute(bot, msg, args) {
        const { chat, from, reply_to_message } = msg;

        if (chat.type === 'private') 
            return bot.sendMessage(chat.id, 'This command can only be used in groups.');

        try {
            const botMember = await bot.getChatMember(chat.id, bot.id);
            if (!botMember.can_promote_members) 
                return bot.sendMessage(chat.id, "❌ Bot needs admin rights with promote permissions.");

            const admin = await bot.getChatMember(chat.id, from.id);
            if (!['creator','administrator'].includes(admin.status) || !admin.can_promote_members)
                return bot.sendMessage(chat.id, "❌ Only admins with promotion rights can demote members.");

            if (!reply_to_message) 
                return bot.sendMessage(chat.id, '❌ Please reply to the user to demote.');

            const targetId = reply_to_message.from.id;
            const targetUsername = reply_to_message.from.username || reply_to_message.from.first_name;

            const targetMember = await bot.getChatMember(chat.id, targetId);
            if (targetMember.status === 'creator')
                return bot.sendMessage(chat.id, "❌ Cannot demote the group creator.");

            await bot.restrictChatMember(chat.id, targetId, {
                can_send_messages: true,
                can_send_audios: true,
                can_send_documents: true,
                can_send_photos: true,
                can_send_videos: true,
                can_send_video_notes: true,
                can_send_voice_notes: true,
                can_send_polls: true,
                can_send_other_messages: true,
                can_add_web_page_previews: true,
                can_change_info: false,
                can_invite_users: true,
                can_pin_messages: false,
                can_manage_topics: false
            });

            await bot.sendMessage(chat.id, `✅ Successfully demoted ${targetUsername}.`);
        } catch (err) {
            console.error(err);
            bot.sendMessage(chat.id, `❌ Failed to demote user. Error: ${err.message}`);
        }
    }
};