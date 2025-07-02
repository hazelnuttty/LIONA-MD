const axios = require('axios');

module.exports = function(app) {
    async function fetchIraaAi(text) {
        try {
            const logic = encodeURIComponent(`kamu adalah IraaAi, AI muslim yang cerdas, lucu, dan suka jahil. Balas dengan gaya ngobrol santai, manja, dan penuh emoji lucu.`);
            const url = `https://api.nekorinn.my.id/ai/gpt-turbo-logic?text=${encodeURIComponent(text)}&logic=${logic}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching from IraaAi:", error.response?.data || error.message);
            throw new Error("Gagal terhubung ke Server IraaAi.");
        }
    }

    app.get('/ai/iraaai', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const result = await fetchIraaAi(text);

            res.status(200).json({
                status: true,
                creator: "Hazel",
                result: result.result || result.message || "Tidak ada respons dari IraaAi 🥺"
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
