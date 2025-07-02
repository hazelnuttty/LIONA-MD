const axios = require('axios');

module.exports = function (app) {
  app.get('/download/videy', async (req, res) => {
    const { url } = req.query;

    if (!url || !url.startsWith('https://videy.co/v?id=')) {
      return res.json({
        status: false,
        message: 'Gunakan link dari Videy. Contoh: ?url=https://videy.co/v?id=xxxxx'
      });
    }

    try {
      // Ambil ID video
      const vid_id = url.split('id=')[1];
      const video_url = `https://cdn.videy.co/${vid_id}.mp4`;

      res.json({
        status: true,
        creator: 'Hazel', // Nama kamu sayang 🥰
        video_url
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal memproses link Videy',
        error: e.message
      });
    }
  });
};
