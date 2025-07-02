const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/text2ghibli', async (req, res) => {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi. Contoh: /ai/text2ghibli?text=kucing lucu di taman'
      });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/ai-img/text2ghibli?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer'
      });

      res.set('Content-Type', 'image/png');
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil gambar dari API eksternal',
        error: err.message
      });
    }
  });
};
