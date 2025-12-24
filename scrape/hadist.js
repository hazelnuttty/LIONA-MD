const axios = require("axios");
const cheerio = require("cheerio");

async function hadist(keyword) {
  const { data } = await axios.get(`https://www.hadits.id/tentang/${keyword}`);
  const $ = cheerio.load(data);
  let hasil = [];
  $("section").each((i, el) => {
    let judul = $(el).find("a").text().trim();
    let link = `https://www.hadits.id${$(el).find("a").attr("href")}`;
    let perawi = $(el).find(".perawi").text().trim();
    let kitab = $(el).find("cite").text().replace(perawi, "").trim();
    let teks = $(el).find("p").text().trim();
    hasil.push({ judul, link, perawi, kitab, teks });
  });
  return hasil;
}

module.exports = hadist;
