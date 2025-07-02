const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
  app.get('/search/google', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ status: false, error: 'Kata kunci (q) diperlukan. contoh: ?q=hacking tools' });

    try {
      const searchURL = `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=id`;
      const { data: html } = await axios.get(searchURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      const $ = cheerio.load(html);
      const results = [];

      $('div.g').each((i, el) => {
        const title = $(el).find('h3').text();
        const url = $(el).find('a').attr('href');
        const desc = $(el).find('.VwiC3b').text();

        if (title && url) {
          results.push({
            judul: title,
            url: url,
            deskripsi: desc
          });
        }
      });

      res.json({
        status: true,
        creator: 'Hazel',
        keyword: q,
        total: results.length,
        hasil: results
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data dari Google Search',
        error: e.message
      });
    }
  });
};
