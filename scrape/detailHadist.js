const axios = require("axios");
const cheerio = require("cheerio");

async function detailHadist(url) {
  let { data } = await axios.get(url);
  let $ = cheerio.load(data);
  const title = $("article h1").text().trim();
  const breadcrumb = [];
  $("div.breadcrumb-menu ol.breadcrumbs li").each((i, el) => breadcrumb.push($(el).text().trim()));
  const hadithContent = $("article p.rtl").text().trim();
  const hadithNumberMatch = $("header .hadits-about h2").text().match(/No. (\d+)/);
  const hadithNumber = hadithNumberMatch ? hadithNumberMatch[1] : "Tidak diketahui";
  return { title, breadcrumb, haditsArab: hadithContent, hadithNumber };
}

module.exports = detailHadist;
