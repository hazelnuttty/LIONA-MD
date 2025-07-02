const axios = require('axios');

module.exports = function(app) {
  async function fetchGemini(text) {
    try {
      const response = await axios.get('https://api.nekorinn.my.id/ai/gemini', {
        params: { text }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching from Gemini:", error.response?.data || error.message);
      throw new Error("Gagal terhubung ke Gemini.");
    }
  }

  app.get('/ai/gemini', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: 'Text is required' });
      }

      const result = await fetchGemini(text);

      res.status(200).json({
        status: true,
        creator: "Hazel",
        result: result.result || result.message || "Tidak ada respons dari Gemini 🥺"
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
