const axios = require("axios")
const cheerio = require("cheerio")

async function happymod(query) {
  try {
    const res = await axios.get("https://unduh.happymod.com/search.html?q=" + query);
    const html = res.data;
    const $ = cheerio.load(html);
    const data = [];
    $('article.flex-item').each((index, element) => {
      const appName = $(element).find('h2.has-normal-font-size.no-margin.no-padding.truncate').text().trim();
      const appVersion = $(element).find('div.has-small-font-size.truncate').first().text().trim();
      const appUrl = $(element).find('a.app.clickable').attr('href');

      if (appName && appVersion && appUrl) {
        data.push({
          name: appName,
          version: appVersion,
          url: "https://unduh.happymod.com/"+appUrl
        });
      }
    });
    return {
      status: true,
      data
    }
  } catch (error) {
    return {
      status: false,
      message: "permintaan tidak dapat diproses!!"
    }
  }
}

module.exports = function (app) {
app.get('/search/happymod', async (req, res) => {
        try {        
    const { q } = req.query;
    if (!q) return res.json({ status: false, error: 'Query is required' });
            const results = await happymod(q);  
            res.status(200).json({
                status: true,
                result: results.data
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}