const axios = require('axios');

module.exports = function (app) {
  app.get('/info/cuaca', async (req, res) => {
    const kode = req.query.kode;
    if (!kode) {
      return res.status(400).json({
        status: false,
        creator: 'Hazel',
        message: 'parameter ?kode wajib diisi',
      });
    }

    try {
      const response = await axios.get(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kode}`);
      const data = response.data;

      if (!data || !data.length) {
        return res.status(404).json({
          status: false,
          creator: 'Hazel',
          message: 'Data cuaca tidak ditemukan untuk kode ini',
        });
      }

      res.json({
        status: true,
        creator: 'Hazel',
        wilayah: data[0].adm4,
        provinsi: data[0].adm1,
        prakiraan: data.map(item => ({
          waktu: item.time,
          cuaca: item.weather,
          suhu: `${item.tempC}°C`,
          kelembapan: `${item.humidity}%`,
        })),
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        creator: 'Hazel',
        message: 'Gagal mengambil data dari BMKG',
        error: e.message,
      });
    }
  });
};
