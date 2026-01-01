const { AgentControl } = require('./AgentControl.js');

async function Agent(chatId, prompt) {
    return await AgentControl(chatId, prompt);
}

module.exports = { Agent };
