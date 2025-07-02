const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/text2qr', async (req, res) => {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        creator: 'Hazel',
        message: 'Parameter "text" wajib diisi. Contoh: /tools/text2qr?text=halo cipiti'
      });
    }

    try {
      const apiUrl = `https://api.siputzx.my.id/api/tools/text2qr?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer' // karena hasilnya gambar QR
      });

      res.setHeader('Content-Type', 'image/png');
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: 'Hazel',
        message: 'Gagal menghasilkan QR Code',
        error: err.message
      });
    }
  });
};
