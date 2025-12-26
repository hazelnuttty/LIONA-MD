const fs = require('fs');
const path = require('path');
const { isOwner } = require('../lib/owner.js');
const config = require('../config.js');

module.exports = {
    name: 'delowner',
    category: 'owner',
    description: 'Delete an owner.',
    async execute(bot, msg, args) {
        if (!isOwner(msg.from.id)) {
            return bot.sendMessage(msg.chat.id, 'This command is for owners only.');
        }

        const { chat, reply_to_message } = msg;
        let targetId;

        if (reply_to_message) {
            targetId = reply_to_message.from.id;
        } else if (args[0]) {
            targetId = args[0];
        } else {
            return bot.sendMessage(chat.id, 'Please reply to a user or provide a user ID.');
        }

        targetId = String(targetId);
        if (!/^\d+$/.test(targetId)) {
            return bot.sendMessage(chat.id, 'Invalid user ID.');
        }

        const ownerIds = Array.isArray(config.ownerId) ? config.ownerId : [config.ownerId];
        if (!ownerIds.includes(targetId)) {
            return bot.sendMessage(chat.id, 'This user is not an owner.');
        }
        
        if (ownerIds.length === 1) {
            return bot.sendMessage(chat.id, 'You cannot remove the last owner.');
        }

        const newOwnerIdsArray = ownerIds.filter(id => id !== targetId);

        const configPath = path.resolve(__dirname, '../config.js');
        try {
            let configData = fs.readFileSync(configPath, 'utf8');
            const newOwnerIds = JSON.stringify(newOwnerIdsArray);
            configData = configData.replace(/ownerId:\s*\[.*\]/, `ownerId: ${newOwnerIds}`);
            fs.writeFileSync(configPath, configData, 'utf8');
            
            await bot.sendMessage(chat.id, `Successfully removed ${targetId} from owners.`);
        } catch (error) {
            console.error(error);
            await bot.sendMessage(chat.id, 'Failed to remove owner.');
        }
    }
};
