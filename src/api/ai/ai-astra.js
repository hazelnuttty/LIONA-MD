const axios = require('axios');

module.exports = function (app) {
    const GEMINI_API_URL = 'https://api.siputzx.my.id/api/ai/gemini';
    const GEMINI_COOKIE = 'g.a000xgjZzrQfaZEtfrx6RTCW0Q2eNdm21jCoqu6_6gbIG_5BW1UqEWHMHU14F9OS04MFWXsY7gACgYKAYQSARESFQHGX2MidwdmCRTP1XVih97lZJXIcBoVAUF8yKrcN4up_gHiXrkm5wXkr5eG0076';
    const SYSTEM_PROMPT = 'kamu adalah ai bahasa indonesia, nama kamu adalah astra Ai, kamu diciptakan oleh hazelnut dan team NepTune, Tugas kamu adalah menjawab semua pertanyaan dengan sopan dan baik dengan emoji dan text lucu';

    async function checkDatabase(text) {
        try {
            const [resAstraAI, resDatabase] = await Promise.all([
                axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/local.json'),
                axios.get('https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/AstraAi.json')
            ]);

            const data = [...resAstraAI.data, ...resDatabase.data];
            const lowerText = text.toLowerCase();

            for (const item of data) {
                const patterns = (item.patterns || []).map(p => p.toLowerCase());
                if (patterns.some(p => lowerText.includes(p))) {
                    const responses = item.responses || [];
                    if (responses.length > 0) {
                        return responses[Math.floor(Math.random() * responses.length)];
                    }
                }
            }

            return null;
        } catch (err) {
            console.error('Gagal mengambil database lokal:', err.message);
            return null;
        }
    }

    async function callGeminiAI(userText) {
        try {
            const start = Date.now();
            const response = await axios.get(GEMINI_API_URL, {
                params: {
                    text: userText,
                    cookie: GEMINI_COOKIE,
                    promptSystem: SYSTEM_PROMPT
                },
                timeout: 10000,
                headers: {
                    'User-Agent': 'AstraAI/1.0 (Hazel)'
                }
            });

            const result = response.data?.result || response.data?.message || JSON.stringify(response.data);
            const speed = Date.now() - start;

            return {
                status: true,
                result,
                speed_ms: speed
            };
        } catch (error) {
            console.warn(`Gagal menggunakan Astra: ${error.message}`);
            return {
                status: false,
                result: `AI gagal merespons: ${error.message}`
            };
        }
    }

    app.get('/ai/astraai', async (req, res) => {
        const text = (req.query.text || '').trim();

        if (!text) {
            return res.status(400).json({
                status: false,
                creator: "Hazel",
                source: "Astra AI",
                result: 'Parameter ?text= wajib diisi ya'
            });
        }

        try {
            const localResponse = await checkDatabase(text);
            if (localResponse) {
                return res.status(200).json({
                    status: true,
                    creator: "Hazel",
                    source: "Astra AI",
                    result: localResponse
                });
            }

            const result = await callGeminiAI(text);
            return res.status(result.status ? 200 : 500).json({
                status: result.status,
                creator: "Hazel",
                source: "Astra AI",
                result: result.result,
                speed_ms: result.speed_ms || undefined
            });
        } catch (err) {
            console.error('Internal Error:', err);
            return res.status(500).json({
                status: false,
                creator: "Hazel",
                source: "Astra AI",
                result: 'Terjadi kesalahan tak terduga 😵'
            });
        }
    });
};
