const { callGemini } = require('./_AiAgent.js');

const system_prompt = `You are an expert executor. Your job is to execute the given refined plan to fulfill a user's request.
Follow the steps precisely and provide a comprehensive final answer.
Do not repeat the plan or the user request in your output. Just provide the final result.`;

async function executorAgent(prompt, refinedPlan) {
    const execution_prompt = `User Request: "${prompt}"\n\nRefined Execution Plan:\n${refinedPlan}\n\nPlease execute the plan and provide the final, complete answer.`;
    return await callGemini(system_prompt, execution_prompt);
}

module.exports = { executorAgent };

