const axios = require("axios");
const cheerio = require("cheerio");

async function getPrayerSchedule(cityId) {
  const { data } = await axios.get(`https://www.jadwalsholat.org/jadwal-sholat/monthly.php?id=${cityId}`, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const $ = cheerio.load(data);
  const cityName = $('select[name=kota] option[selected]').text().trim();
  const today = new Date().getDate();
  let todaySchedule = null;
  $('tr[class^="table_"]').each((i, row) => {
    const cells = $(row).find("td");
    if (cells.length === 9 && parseInt(cells.eq(0).text().trim()) === today) {
      todaySchedule = {
        imsyak: cells.eq(1).text().trim(),
        shubuh: cells.eq(2).text().trim(),
        terbit: cells.eq(3).text().trim(),
        dhuha: cells.eq(4).text().trim(),
        dzuhur: cells.eq(5).text().trim(),
        ashr: cells.eq(6).text().trim(),
        maghrib: cells.eq(7).text().trim(),
        isya: cells.eq(8).text().trim()
      };
    }
  });
  return todaySchedule ? { kota: cityName, jadwal: todaySchedule } : null;
}

module.exports = getPrayerSchedule;
