const fs = require('fs');
const path = require('path');
const bot = require('../lib/login.js');
const print = require('../lib/print.js');
const config = require('../config.js');
const db = require('../lib/database.js');
const { isOwner } = require('../lib/owner.js');

const helper = require('../function/helper.js');

print.init(bot);
function loadScrapers() {
    const scrapeDir = path.join(__dirname, '..', 'scrape');
    if (!fs.existsSync(scrapeDir)) {
        fs.mkdirSync(scrapeDir);
        return;
    }
    const scraperFiles = fs.readdirSync(scrapeDir).filter(file => file.endsWith('.js'));
    for (const file of scraperFiles) {
        try {
            const filePath = path.join(scrapeDir, file);
            const scraper = require(filePath);
            const funcName = path.basename(file, '.js');
            bot[funcName] = scraper;
        } catch (error) {
            print.error(error, `Load Scraper ${file}`);
        }
    }
    print.info(`${scraperFiles.length} scraper functions loaded.`);
}

function loadCommands(dirs) {
    for (const dir of dirs) {
        const commandFiles = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of commandFiles) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                loadCommands([fullPath]);
            } else if (file.name.endsWith('.js')) {
                try {
                    const command = require(fullPath);
                    if (command.name) {
                        bot.commands.set(command.name, command);
                        if (command.aliases && command.aliases.length > 0) {
                            command.aliases.forEach(alias => bot.commands.set(alias, command));
                        }
                    }
                } catch (error) {
                    print.error(error, `Load Command ${file.name}`);
                }
            }
        }
    }
}

function reloadPlugin(filePath) {
    try {
        const command = require(filePath);
        if (command.name) {
            bot.commands.set(command.name, command);
            if (command.aliases && command.aliases.length > 0) {
                command.aliases.forEach(alias => bot.commands.set(alias, command));
            }
            print.success(`Plugin reloaded: ${command.name}`);
        }
    } catch (error) {
        print.error(error, `Reload Command ${path.basename(filePath)}`);
    }
}

bot.commands = new Map();
loadScrapers();
const commandDirs = [
    path.join(__dirname, '..', 'plugins'),
    path.join(__dirname, '..', 'function')
];
loadCommands(commandDirs);
print.success(`${bot.commands.size} total commands and aliases loaded.`);

bot.db = db;
require('../lib/handler')(bot);
const reloadDirs = [
    ...commandDirs,
    path.join(__dirname, '..', 'lib'),
    path.join(__dirname, '..', 'scrape'),
    path.join(__dirname, '..', 'config.js')
];
require('../lib/autoReload')(reloadDirs, reloadPlugin);

try {
    const jadibotPlugin = bot.commands.get('jadibot');
    if (jadibotPlugin && jadibotPlugin.initializeJadibots) {
        jadibotPlugin.initializeJadibots(bot);
    }
} catch (e) {
    print.error(e, 'Failed to initialize jadibots');
}


bot.on('message', async (msg) => {
    if (!msg.chat || !msg.from) return;

    if (db.isBanned(msg.from.id)) return;
    if (db.isBanned(msg.chat.id) && !isOwner(msg.from.id)) {
        return;
    }

    const isModerated = await bot.handleModeration(msg);
    if (isModerated) return;

    const isSpam = await helper.handleAntiSpam(bot, msg);
    if (isSpam) return;

    const { chat, from, message_id, text, caption, photo, entities } = msg;
    const messageText = text || caption || '';
    if (!messageText) return;

    const prefixes = ['.', '/', 'liona'];
    const prefix = prefixes.find(p => messageText.startsWith(p));
    if (!prefix) return;

    const args = messageText.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    const command = bot.commands.get(commandName);

    if (!command) return;

    if (config.botMode === 'self' && !isOwner(msg.from.id)) {
        return;
    }

    try {
        print.info(`Executing command: ${command.name} | User: ${from.username || from.id}`);
        await command.execute(bot, msg, args);
    } catch (error) {
        print.error(error, `Command ${command.name}`);
        print.userError(chat.id);
    }
});

bot.on('new_chat_members', (msg) => helper.handleWelcome(bot, msg));
bot.on('left_chat_member', (msg) => helper.handleLeftChatMember(bot, msg));

process.on('SIGINT', () => {
    print.warn('Bot is stopping...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    print.warn('Bot is stopping...');
    bot.stopPolling();
    process.exit(0);
});

print.success("Main script active! Bot is ready for commands.");