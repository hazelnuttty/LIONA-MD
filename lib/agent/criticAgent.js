const { callCerebras } = require('./_AiAgent.js');

const system_prompt = `You are a critic agent. Your task is to review a generated plan and the 'thinking' process behind it, based on the user's original request.
Your goal is to refine the plan for the executor.
- Analyze the user's request, the initial plan, and the thinking notes.
- If the plan is flawed, illogical, or can be improved, you must provide a better, more detailed, and corrected plan for the executor to follow.
- If the plan is already excellent, return it as is.
- Only output the final, refined plan. Do not add any other commentary.`;

async function criticAgent(prompt, plan, thinking) {
    const critic_prompt = `User Request: "${prompt}"\n\nInitial Plan:\n${plan}\n\nThinking Notes:\n${thinking}\n\nBased on the above, provide the final, refined plan for the executor.`;
    return await callCerebras(system_prompt, critic_prompt);
}

module.exports = { criticAgent };

