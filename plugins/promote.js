module.exports = {
    name: 'promote',
    category: 'group',
    description: 'Promote a user to admin.',
    async execute(bot, msg, args) {
        const { chat, from, reply_to_message, entities, text } = msg;

        if (chat.type === 'private') {
            return bot.sendMessage(chat.id, 'This command can only be used in groups.');
        }

        try {
            const botMember = await bot.getChatMember(chat.id, bot.id);
            if (!botMember.can_promote_members) {
                return bot.sendMessage(chat.id, "I don't have permission to promote members.");
            }

            const admin = await bot.getChatMember(chat.id, from.id);
            if (!['creator', 'administrator'].includes(admin.status)) {
                return bot.sendMessage(chat.id, 'Only admins can use this command.');
            }
             if (!admin.can_promote_members) {
                return bot.sendMessage(chat.id, "You don't have permission to promote members.");
            }

            let targetId;
            let targetUsername;

            if (reply_to_message) {
                targetId = reply_to_message.from.id;
                targetUsername = reply_to_message.from.username ? `@${reply_to_message.from.username}` : reply_to_message.from.first_name;
            } else if (args.length > 0) {
                const identifier = args[0];
                if (identifier.startsWith('@')) {
                    try {
                        const chatInfo = await bot.getChat(identifier);
                        targetId = chatInfo.id;
                        targetUsername = identifier;
                    } catch (e) {
                        return bot.sendMessage(chat.id, `Could not find user ${identifier}. Please use a reply or a valid user ID.`);
                    }
                } else if (/^\d+$/.test(identifier)) {
                    targetId = parseInt(identifier, 10);
                    try {
                        const member = await bot.getChatMember(chat.id, targetId);
                        targetUsername = member.user.username ? `@${member.user.username}` : member.user.first_name;
                    } catch (e) {
                        targetUsername = `user with ID ${targetId}`;
                    }
                } else if (entities) {
                    const mention = entities.find(e => e.type === 'text_mention' && e.user);
                    if (mention) {
                        targetId = mention.user.id;
                        targetUsername = mention.user.first_name;
                    }
                }
            }

            if (!targetId) {
                return bot.sendMessage(chat.id, 'Please reply to the user, mention them (@username), or provide their user ID to promote.');
            }

            await bot.promoteChatMember(chat.id, targetId, {
                can_change_info: false,
                can_delete_messages: false,
                can_invite_users: true,
                can_restrict_members: false,
                can_pin_messages: false,
                can_promote_members: false
            });

            await bot.sendMessage(chat.id, `✅ Successfully promoted ${targetUsername}.`);
            await bot.sendMessage(chat.id, `Notifikasi: ${targetUsername} telah dipromosikan menjadi admin.`);

        } catch (error) {
            await bot.sendMessage(chat.id, `❌ Failed to promote user. Error: ${error.message}`);
        }
    }
};
