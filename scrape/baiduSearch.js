const axios = require("axios");
const cheerio = require("cheerio");

async function baiduSearch(query) {
  if (!query) return [];
  const url = "https://www.baidu.com/s?wd=" + encodeURIComponent(query);
  let res;
  try {
    res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
  } catch {
    return [];
  }
  if (!res?.data) return [];
  const $ = cheerio.load(res.data);
  const results = [];
  $("h3.t").each((i, el) => {
    const title = $(el).text().trim();
    const link = $(el).find("a").attr("href");
    if (title && link) results.push({ title, link });
  });
  return results;
}

module.exports = baiduSearch;
