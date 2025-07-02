const axios = require("axios")
const cheerio = require("cheerio")

async function bilibili(q) {
  try {
    const response = await axios.get(`https://www.bilibili.tv/id/search-result?q=${q}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.1.0; CPH1803; Build/OPM1.171019.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.4280.141 Mobile Safari/537.36 KiToBrowser/124.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'id-ID',
        'referer': 'https://www.bilibili.tv/id/search',
        'upgrade-insecure-requests': '1',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'priority': 'u=0, i',
        'te': 'trailers'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    let results = [];

    $('.section__list__item').each((index, element) => {
      let title = $(element).find('.highlights').text().trim();
      let url = 'https://www.bilibili.tv' + $(element).find('.bstar-video-card__text a').attr('href');
      let thumbnail = $(element).find('.bstar-video-card__cover-img img').attr('src');
      let duration = $(element).find('.bstar-video-card__cover-mask-text').text().trim();
      let uploader = $(element).find('.bstar-video-card__nickname span').text().trim();
      let uploaderUrl = 'https://www.bilibili.tv' + $(element).find('.bstar-video-card__nickname').attr('href');
      let views = $(element).find('.bstar-video-card__desc').text().trim().replace(' · ', '');

      results.push({
        title,
        url,
        thumbnail,
        duration,
        uploader,
        uploaderUrl,
        views
      });
    });

    return results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

module.exports = function (app) {
app.get('/search/bstation-search', async (req, res) => {
        try {           
    const { q } = req.query;
    if (!q) return res.json({ status: false, error: 'Query is required' });
            const results = await bilibili(q);  
            res.status(200).json({
                status: true,
                result: results
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}