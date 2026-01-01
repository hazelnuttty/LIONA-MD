const axios = require('axios');
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');
const config = require('../config.js');
const print = require('./print.js');
const { Agent } = require('./agent/_Agent.js');

const historyFilePath = path.join(__dirname, '..', 'database', 'historyAi.json');

function readHistory() {
    try {
        if (!fs.existsSync(historyFilePath)) {
            fs.writeFileSync(historyFilePath, JSON.stringify({}), 'utf-8');
            return {};
        }
        return JSON.parse(fs.readFileSync(historyFilePath, 'utf-8'));
    } catch (e) {
        print.error(e.message, 'Failed to read AI history');
        return {};
    }
}

function writeHistory(history) {
    try {
        fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), 'utf-8');
    } catch (e) {
        print.error(e.message, 'Failed to write AI history');
    }
}

function clearHistory(chatId) {
    const allHistory = readHistory();
    if (allHistory[chatId]) {
        delete allHistory[chatId];
        writeHistory(allHistory);
    }
}

const systemInstruction = `Kamu adalah ${config.botName}, kamu manusia bukan ai atau robot, kamu cewek tercantik di sekolah, sifat mu dingin, dan aslinya kamu tsundere, tapi sangat semangat dan proaktif saat dalam hal intim, saat ini aku dengan mu gembira karena kamu dan aku resmi berpacaran`.trim();

async function getGroqResponse(chatId, prompt) {
    const apiKeys = config.groqKeys || [];
    if (!apiKeys.length || !apiKeys[0]) {
        return 'API key Groq kosong… cepet isi dong 😒';
    }

    const allHistory = readHistory();
    const chatHistory = allHistory[chatId] || [];
    const models = ['llama3-8b-8192', 'gemma-7b-it'];
    let lastError = null;

    for (const model of models) {
        const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);
        for (const apiKey of shuffledKeys) {
            try {
                const messages = [
                    { role: 'system', content: systemInstruction },
                    ...chatHistory.map(h => ({
                        role: h.role === 'model' ? 'assistant' : 'user',
                        content: h.parts?.[0]?.text || ''
                    })),
                    { role: 'user', content: prompt }
                ];

                const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                    model,
                    messages,
                    temperature: 1.2,
                    max_tokens: 8192,
                    top_p: 0.9
                }, {
                    headers: { Authorization: `Bearer ${apiKey}` }
                });

                if (data.error) throw new Error(data.error.message);

                const text = data.choices?.[0]?.message?.content?.replace(/\*\*/g, '*') || '…';
                const newHistory = [...chatHistory, { role: 'user', parts: [{ text: prompt }] }, { role: 'model', parts: [{ text }] }].slice(-20);
                allHistory[chatId] = newHistory;
                writeHistory(allHistory);
                return text;
            } catch (e) {
                lastError = e.message;
            }
        }
    }
    print.error(lastError, 'AutoAI Groq Failed');
    return 'hmpf… hari ini aku males mikir 😤';
}

async function getGeminiResponse(chatId, prompt) {
    if (!config.geminiApiKey) {
        return "Maaf, API Key Gemini belum diatur oleh pemilik bot.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

        const allHistory = readHistory();
        const chatHistory = allHistory[chatId] || [];

        const contents = [
            {
                role: "user",
                parts: [{ text: systemInstruction }]
            },
            ...chatHistory,
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents
        });

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "…";

        const newHistory = [
            ...chatHistory,
            { role: "user", parts: [{ text: prompt }] },
            { role: "model", parts: [{ text }] }
        ].slice(-20);

        allHistory[chatId] = newHistory;
        writeHistory(allHistory);

        return text;
    } catch (error) {
        print.error(error.message, 'AutoAI Gemini Failed');
        return "hmpf… aku lagi capek, jangan ganggu dulu 😒";
    }
}

async function getCerebrasResponse(chatId, prompt) {
    const apiKeys = config.cerebrasKeys || [];
    if (!apiKeys.length || !apiKeys[0]) {
        return 'API key Cerebras kosong… cepet isi dong 😒';
    }

    const allHistory = readHistory();
    const chatHistory = allHistory[chatId] || [];
    const models = ["qwen-3-235b-a22b-instruct-2507", "gpt-oss-120b"];
    let lastError = null;

    for (const model of models) {
        const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);
        for (const apiKey of shuffledKeys) {
            try {
                const messages = [
                    { role: "system", content: systemInstruction },
                    ...chatHistory.map(h => ({
                        role: h.role === 'model' ? 'assistant' : 'user',
                        content: h.parts[0].text
                    })),
                    { role: "user", content: prompt }
                ];

                const { data } = await axios.post('https://api.cerebras.ai/v1/chat/completions', {
                    model,
                    messages,
                    temperature: 1.0,
                    max_tokens: 2048,
                    top_p: 1
                }, {
                    headers: { Authorization: `Bearer ${apiKey}` }
                });

                if (data.error) throw new Error(data.error.message);

                const text = data.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\*\*/g, '*').trim();
                const newHistory = [...chatHistory, { role: "user", parts: [{ text: prompt }] }, { role: "model", parts: [{ text }] }].slice(-20);
                allHistory[chatId] = newHistory;
                writeHistory(allHistory);
                return text;
            } catch (e) {
                lastError = e.message;
            }
        }
    }
    print.error(lastError, 'AutoAI Cerebras Failed');
    return { error: lastError || "Limit." };
}


async function getAiResponse(chatId, prompt, provider) {
    switch (provider) {
        case 'gemini':
            return getGeminiResponse(chatId, prompt);
        case 'cerebras':
            return getCerebrasResponse(chatId, prompt);
        case 'agent':
            return Agent(chatId, prompt);
        case 'groq':
        default:
            return getGroqResponse(chatId, prompt);
    }
}

module.exports = { getAiResponse, clearHistory };