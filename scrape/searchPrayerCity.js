const axios = require("axios");
const cheerio = require("cheerio");

async function searchPrayerCity(query) {
  const { data } = await axios.get("https://www.jadwalsholat.org/jadwal-sholat/monthly.php", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const $ = cheerio.load(data);
  const cities = [];
  $('select[name=kota] option').each((i, el) => {
    const id = $(el).attr("value");
    const name = $(el).text().trim();
    if (id && name) cities.push({ id, name, search: name.toLowerCase() });
  });
  const filtered = cities.filter((c) => c.search.includes(query.toLowerCase()));
  return filtered.length > 0 ? filtered[0] : null;
}

module.exports = searchPrayerCity;
