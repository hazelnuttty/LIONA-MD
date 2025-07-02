const axios = require('axios');

module.exports = function (app) {
  app.get('/imagecreator/toghibli', async (req, res) => {
    const { image_url, format } = req.query;

    if (!image_url) {
      return res.status(400).json({
        status: false,
        creator: 'Hazel',
        message: 'Parameter "image_url" wajib diisi. Contoh: /imagecreator/toghibli?image_url=https://example.com/foto.jpg'
      });
    }

    try {
      const apiUrl = `https://nirkyy-dev.hf.space/api/v1/ghiblistyle?url=${encodeURIComponent(image_url)}`;
      const response = await axios.get(apiUrl);

      const imageResult = response.data?.result || null;

      if (!imageResult) {
        return res.status(500).json({
          status: false,
          creator: 'Hazel',
          message: 'Gagal mendapatkan hasil dari server'
        });
      }

      if (format === 'image') {
        // Ambil data gambar dari URL dan stream langsung ke response
        const imageResponse = await axios.get(imageResult, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', 'image/png');
        return res.send(imageResponse.data);
      } else {
        // Default JSON response
        return res.json({
          status: response.data.status,
          creator: 'Hazel',
          message: response.data.message || 'Berhasil mengubah gambar ke gaya Ghibli',
          url: imageResult
        });
      }

    } catch (err) {
      return res.status(500).json({
        status: false,
        creator: 'Hazel',
        message: 'Gagal Menghubungi Server',
        error: err.message
      });
    }
  });
};
