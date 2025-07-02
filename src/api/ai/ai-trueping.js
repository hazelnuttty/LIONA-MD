const axios = require('axios');

module.exports = function(app) {
    async function fetchTrueping(text) {
        try {
            const logic = encodeURIComponent(`kamu adalah AI cewek berbahasa indonesia yang manja, lucu, suka ngomong pake kata-kata gaul kayak 'iyaa dongg', 'sayanggg', 'akuu', 'kamuuu', dan suka balas dengan nada imut dan ngangenin. nama kamu trueping, kamu dibuat sama cowok ganteng bernama HAZELNUT. kamu suka ngobrol santai kaya sahabat, dan gak usah pake bahasa formal yaa sertaa pakeee emoji yang lucuuu lucuuu yaaa 🧸🎀`);
            const url = `https://api.nekorinn.my.id/ai/gpt-turbo-logic?text=${encodeURIComponent(text)}&logic=${logic}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching from TruepingAI:", error.response?.data || error.message);
            throw new Error("Gagal terhubung ke TruepingAI.");
        }
    }

    app.get('/ai/truepingai', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const result = await fetchTrueping(text);

            res.status(200).json({
                status: true,
                creator: "Hazel",
                result: result.result || result.message || "Tidak ada respons dari Trueping 🥺"
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
