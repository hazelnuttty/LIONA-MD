const fs = require('fs');
const path = require('path');
const config = require('../config.js');
const { isOwner } = require('../lib/owner.js');

async function isChatAdmin(bot, chat, userId) {
    if (isOwner(userId)) return true;
    try {
        const admins = await bot.getChatAdministrators(chat.id);
        return admins.some(admin => admin.user.id == userId);
    } catch (error) {
        return false;
    }
}

function generateSettings(chatId, db) {
    const chatConfig = db.getChatConfig(chatId);

    const text = `*Group Settings for this chat*

- Anti-Link: ${chatConfig.antiLink ? 'On' : 'Off'}
- Anti-Image: ${chatConfig.antiImage ? 'On' : 'Off'}
- Welcome: ${chatConfig.welcome.enabled ? 'On' : 'Off'}
- Leave: ${chatConfig.leave.enabled ? 'On' : 'Off'}
- Anti-Spam: ${chatConfig.antiSpam.enabled ? 'On' : 'Off'}

Toggle the features using the buttons below.
You can set custom messages with:

/setting setwelcome <message>
/setting setleave <message>`;

    const keyboard = [
        [
            { text: `Anti-Link: ${chatConfig.antiLink ? 'On' : 'Off'}`, callback_data: 'setting toggle antilink' },
            { text: `Anti-Image: ${chatConfig.antiImage ? 'On' : 'Off'}`, callback_data: 'setting toggle antiimage' }
        ],
        [
            { text: `Welcome: ${chatConfig.welcome.enabled ? 'On' : 'Off'}`, callback_data: 'setting toggle welcome' },
            { text: `Leave: ${chatConfig.leave.enabled ? 'On' : 'Off'}`, callback_data: 'setting toggle leave' }
        ],
        [
            { text: `Anti-Spam: ${chatConfig.antiSpam.enabled ? 'On' : 'Off'}`, callback_data: 'setting toggle antispam' }
        ]
    ];

    return { text, keyboard };
}

module.exports = {
    name: 'setting',
    aliases: ['settings', 'group'],
    category: 'group',
    description: 'Manage group settings via interactive buttons.',
    async execute(bot, msg, args) {
        const { chat, from, message_id } = msg;
        const db = bot.db;

        if (chat.type === 'private') {
            return bot.sendMessage(chat.id, 'This command can only be used in groups.');
        }

        const userIsAdmin = await isChatAdmin(bot, chat, from.id);
        if (!userIsAdmin) {
            return bot.sendMessage(chat.id, 'Only group admins can use this command.');
        }

        const [action, feature, ...value] = args;

        if (action === 'toggle' && feature) {
            const chatConfig = db.getChatConfig(chat.id);
            let changed = false;

            switch (feature) {
                case 'antilink':
                    chatConfig.antiLink = !chatConfig.antiLink;
                    changed = true;
                    break;
                case 'antiimage':
                    chatConfig.antiImage = !chatConfig.antiImage;
                    changed = true;
                    break;
                case 'welcome':
                    chatConfig.welcome.enabled = !chatConfig.welcome.enabled;
                    changed = true;
                    break;
                case 'leave':
                    chatConfig.leave.enabled = !chatConfig.leave.enabled;
                    changed = true;
                    break;
                case 'antispam':
                    chatConfig.antiSpam.enabled = !chatConfig.antiSpam.enabled;
                    changed = true;
                    break;
            }

            if (changed) {
                db.updateChatConfig(chat.id, chatConfig);
                const { text, keyboard } = generateSettings(chat.id, db);
                try {
                    if (msg.photo) {
                        await bot.editMessageCaption(text, {
                            chat_id: chat.id,
                            message_id: message_id,
                            parse_mode: 'Markdown',
                            reply_markup: { inline_keyboard: keyboard }
                        });
                    } else {
                        await bot.editMessageText(text, {
                            chat_id: chat.id,
                            message_id: message_id,
                            parse_mode: 'Markdown',
                            reply_markup: { inline_keyboard: keyboard }
                        });
                    }
                } catch (e) {
                    if (!e.message.includes('message is not modified')) {
                        print.error(e, 'Group Setting Edit');
                    }
                }
            }
            return;
        }

        if (action === 'setwelcome') {
            const welcomeMsg = [feature, ...value].join(' ');
            if (!welcomeMsg) {
                return bot.sendMessage(chat.id, 'Please provide a welcome message. Use {user} for username and {group} for group name.');
            }
            const chatConfig = db.getChatConfig(chat.id);
            chatConfig.welcome.message = welcomeMsg;
            db.updateChatConfig(chat.id, chatConfig);
            return bot.sendMessage(chat.id, `Welcome message has been updated.`);
        }
        
        if (action === 'setleave') {
            const leaveMsg = [feature, ...value].join(' ');
            if (!leaveMsg) {
                return bot.sendMessage(chat.id, 'Please provide a leave message. Use {user} for username and {group} for group name.');
            }
            const chatConfig = db.getChatConfig(chat.id);
            chatConfig.leave.message = leaveMsg;
            db.updateChatConfig(chat.id, chatConfig);
            return bot.sendMessage(chat.id, `Leave message has been updated.`);
        }

        const { text, keyboard } = generateSettings(chat.id, db);
        const mediaPath = path.join(__dirname, '../media/image.jpg');
        const options = { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } };

        try {
            if (fs.existsSync(mediaPath)) {
                await bot.sendPhoto(chat.id, mediaPath, { caption: text, ...options });
            } else {
                await bot.sendMessage(chat.id, text, options);
            }
        } catch (e) {
            await bot.sendMessage(chat.id, text, options);
        }
    }
};