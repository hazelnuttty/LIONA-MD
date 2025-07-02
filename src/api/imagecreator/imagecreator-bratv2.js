const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/bratv2', async (req, res) => {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi. Contoh: /imagecreator/bratv2?text=halo dunia'
      });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/maker/brat-v2?text=${encodeURIComponent(text)}`;
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
