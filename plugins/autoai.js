const { isOwner } = require('../lib/owner.js');
const { clearHistory } = require('../lib/_AutoAi.js');

async function isChatAdmin(bot, chat, userId) {
    if (isOwner(userId)) return true;
    try {
        const admins = await bot.getChatAdministrators(chat.id);
        return admins.some(admin => admin.user.id == userId);
    } catch (error) {
        return false;
    }
}

module.exports = {
  name: 'autoai',
  category: 'utility',
  description: 'Enable or disable the AutoAI feature for this chat, and select the AI provider.',
  async execute(bot, msg, args) {
    const { chat, from } = msg;
    const db = bot.db;

    if (chat.type !== 'private') {
        const userIsAdmin = await isChatAdmin(bot, chat, from.id);
        if (!userIsAdmin) {
          return bot.sendMessage(chat.id, 'Only group admins can use this command in a group.');
        }
    }

    const validProviders = ['groq', 'gemini', 'cerebras'];
    let provider = 'groq'; // Default provider
    let state;

    const providerArg = args.find(arg => arg.startsWith('--'));
    if (providerArg) {
        const parsedProvider = providerArg.slice(2);
        if (validProviders.includes(parsedProvider)) {
            provider = parsedProvider;
        }
    }

    const stateArg = args.find(arg => arg === 'on' || arg === 'off');
    state = stateArg;

    const chatConfig = db.getChatConfig(chat.id);

    if (!state) {
        const status = chatConfig.autoAi.enabled ? 'On' : 'Off';
        const currentProvider = chatConfig.autoAi.provider;
        return bot.sendMessage(chat.id, `*AutoAI Status*

- Status: ${status}
- Provider: ${currentProvider}

*Usage:*
\`/autoai [--provider] <on|off>\`
Example: \`/autoai --gemini on\`
Default provider is groq if not specified.`, { parse_mode: 'Markdown' });
    }

    const newEnabledState = state === 'on';

    if (chatConfig.autoAi.provider !== provider && newEnabledState) {
        clearHistory(chat.id);
        await bot.sendMessage(chat.id, `AI provider changed to *${provider}*. Chat history has been cleared.`, { parse_mode: 'Markdown' });
    }

    chatConfig.autoAi.enabled = newEnabledState;
    chatConfig.autoAi.provider = provider;
    db.updateChatConfig(chat.id, chatConfig);

    await bot.sendMessage(chat.id, `AutoAI feature has been turned *${state.toUpperCase()}* for this chat with provider *${provider}*.`, { parse_mode: 'Markdown' });
  }
};
