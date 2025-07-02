const axios = require('axios');

module.exports = function (app) {
  app.get('/search/gsmarena', async (req, res) => {
    const { phone } = req.query;
    if (!phone) {
      return res.json({ status: false, error: 'Parameter ?phone= diperlukan, contoh: ?phone=Samsung Galaxy S23' });
    }

    try {
      const encoded = encodeURIComponent(phone);
      const url = `https://zenz.biz.id/search/gsmarena?phone=${encoded}`;

      const response = await axios.get(url);
      const data = response.data;

      if (!data || !data.result) {
        return res.json({ status: false, message: 'Data tidak ditemukan' });
      }

      res.json({
        status: true,
        result: data.result
      });

    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data dari API', error: e.message });
    }
  });
};
