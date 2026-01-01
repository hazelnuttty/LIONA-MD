const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const config = require('../../config.js');
const print = require('../print.js');

async function callGemini(system, prompt) {
    if (!config.geminiApiKey) {
        throw new Error('API Key Gemini belum diatur.');
    }

    try {
        const genAI = new GoogleGenAI({
            apiKey: config.geminiApiKey
        });

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            systemInstruction: system,
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ]
        });

        return response.text;
    } catch (error) {
        print.error(error.message, 'Agent Gemini Call Failed');
        throw error;
    }
}

async function callCerebras(system, prompt) {
    const apiKeys = config.cerebrasKeys || [];
    if (!apiKeys.length) {
        throw new Error('API key Cerebras kosong.');
    }

    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    try {
        const { data } = await axios.post(
            'https://api.cerebras.ai/v1/chat/completions',
            {
                model: 'qwen-3-235b-a22b-instruct-2507',
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2048
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (data?.error) {
            throw new Error(data.error.message);
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        print.error(error.message, 'Agent Cerebras Call Failed');
        throw error;
    }
}

module.exports = { callGemini, callCerebras };