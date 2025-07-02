const axios = require('axios');

module.exports = function(app) {
    async function fetchGptTurbo(text) {
        try {
            const url = `https://api.nekorinn.my.id/ai/gpt-turbo?text=${encodeURIComponent(text)}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching from GPT Turbo:", error.response?.data || error.message);
            throw new Error("Gagal terhubung ke GPT Turbo.");
        }
    }

    app.get('/ai/gpt-turbo', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({
                    status: false,
                    error: 'Parameter "text" wajib diisi yaa sayangg 💔'
                });
            }

            const result = await fetchGptTurbo(text);

            res.status(200).json({
                status: true,
                creator: "Hazel",
                result: result.result || result.message || "GPT Turbo-nya diem ajaa 😳"
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "Hazel",
                result: "Maaf yaa sayangg, GPT Turbo-nya lagi errorr 😭💕"
            });
        }
    });
};
