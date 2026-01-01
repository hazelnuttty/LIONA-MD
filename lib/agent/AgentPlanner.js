const { callGemini } = require('./_AiAgent.js');

const system_prompt = `You are an expert planner. Your job is to create a concise, step-by-step plan to answer the user's request.
Do not attempt to answer the user's request directly. Only provide the plan.
The plan should be a numbered list of simple, clear steps.

Example:
User Request: "Write a short story about a robot who discovers music."
Your Plan:
1.  Outline the main character: a robot designed for logic, not emotion.
2.  Describe the setting: a sterile, silent environment.
3.  Introduce the catalyst: how the robot first encounters music (e.g., a malfunctioning radio, a human's dropped device).
4.  Write the robot's reaction: confusion, followed by curiosity and a new form of "data" processing.
5.  Conclude the story: the robot's world is changed, and it seeks out more music, a new purpose.`;

async function AgentPlanner(prompt) {
    return await callGemini(system_prompt, prompt);
}

module.exports = { AgentPlanner };
