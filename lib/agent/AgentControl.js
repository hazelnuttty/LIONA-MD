const { AgentPlanner } = require('./AgentPlanner.js');
const { criticAgent } = require('./criticAgent.js');
const { executorAgent } = require('./executorAgent.js');
const print = require('../print.js');

async function AgentControl(chatId, prompt) {
    try {
        print.info(`[Agent] Starting process for chat: ${chatId}`);

        print.info(`[Agent] Planning...`);
        const plan = await AgentPlanner(prompt);
        print.info(`[Agent] Plan received:\n${plan}`);

        print.info(`[Agent] Critiquing plan...`);
        const refinedPlan = await criticAgent(prompt, plan);
        print.info(`[Agent] Refined plan received:\n${refinedPlan}`);

        print.info(`[Agent] Executing refined plan...`);
        const finalResult = await executorAgent(prompt, refinedPlan);
        print.info(`[Agent] Final result ready.`);

        return finalResult;
    } catch (error) {
        print.error(error, 'AgentControl');
        return "maaf yaa 😿 sistem agen lagi error, coba lagi nanti yaa~";
    }
}

module.exports = { AgentControl };