const axios = require('axios');

module.exports = function(app) {
    async function fetchOpenAi(text) {
        try {
            const payload = { text: text };
            const response = await axios.post('https://api.nekorinn.my.id/ai/openai', payload);
            return response.data;
        } catch (error) {
            console.error("Error fetching from OpenAi:", error.response?.data || error.message);
            throw new Error("Gagal terhubung ke OpenAi.");
        }
    }

    app.get('/ai/openai', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const result = await fetchOpenAi(text);

            res.status(200).json({
                status: true,
                creator: "Hazel",
                result: result.result || result.message || "Tidak ada respons dari OpenAi 🥺"
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "Hazel",
                result: "Maaf, terjadi kesalahan saat memproses permintaan Anda."
            });
        }
    });
};
