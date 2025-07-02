const axios = require('axios');

module.exports = function (app) {
    async function fetchGoogleSearch(query) {
        const url = `https://api.nekorinn.my.id/search/google?q=${encodeURIComponent(query)}`;
        const res = await axios.get(url);
        return res.data;
    }

    async function fetchTrueping(tipe, text) {
        let logicPrompt = '';

        switch (tipe?.toLowerCase()) {
            case 'crypto':
                logicPrompt = `Kamu adalah AI analis profesional di bidang cryptocurrency. Gunakan referensi yang diberikan, analisa secara akurat, teknikal dan fundamental.`;
                break;
            case 'forex':
                logicPrompt = `Kamu adalah AI analis pasar Forex. Berdasarkan referensi yang tersedia, berikan analisa mata uang, indikator teknikal, dan sentimen pasar.`;
                break;
            case 'saham':
                logicPrompt = `Kamu adalah AI analis saham. Gunakan referensi untuk berikan analisis fundamental dan teknikal atas saham terkait.`;
                break;
            case 'trading':
                logicPrompt = `Kamu adalah AI analis trading semua instrumen. Berdasarkan data yang tersedia, berikan strategi, sinyal, dan manajemen risiko.`;
                break;
            default:
                throw new Error("Tipe tidak valid. Gunakan: crypto, forex, saham, atau trading.");
        }

        const url = `https://api.nekorinn.my.id/ai/gpt-turbo-logic?text=${encodeURIComponent(text)}&logic=${encodeURIComponent(logicPrompt)}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'TruepingAI/1.0 (Hazelnut)',
            }
        });

        return response.data;
    }

    app.get('/ai/truepingai-google', async (req, res) => {
        try {
            const { q, tipe } = req.query;

            if (!q || !tipe) {
                return res.status(400).json({
                    status: false,
                    error: 'Parameter "q" (query) dan "tipe" wajib diisi.',
                });
            }

            // 1. Ambil hasil Google
            const googleResult = await fetchGoogleSearch(q);

            if (!googleResult || !googleResult.result || googleResult.result.length === 0) {
                return res.status(404).json({
                    status: false,
                    error: 'Tidak ditemukan hasil dari Google.',
                });
            }

            // 2. Gabungkan jadi satu teks panjang
            const joinedText = googleResult.result
                .map((r, i) => `${i + 1}. ${r.title}\n${r.snippet || r.description || ''}`)
                .join('\n\n');

            // 3. Kirim ke AI
            const result = await fetchTrueping(tipe, joinedText);

            res.status(200).json({
                status: true,
                creator: "Hazel",
                result: result.result || result.message || "Tidak ada jawaban dari AI.",
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "Hazel",
                result: error.message || "Sistem error.",
            });
        }
    });
};
