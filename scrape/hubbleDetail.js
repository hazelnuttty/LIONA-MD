const axios = require("axios");
const cheerio = require("cheerio");

async function hubbleDetail(id) {
  const { data } = await axios.get(`https://esahubble.org/images/${id}/`, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const $ = cheerio.load(data);
  const title = $("h1").first().text().trim();
  const img = $(".archive-image a.popup img");
  const fullImage = $(".archive-image a.popup").attr("href") || null;
  const thumb = img.attr("src") || null;
  const alt = img.attr("alt") || null;
  let description = "";
  $(".archive-image").nextAll("p").each((i, el) => {
    description += $(el).text().trim() + "\n";
  });
  const credit = $(".credit p").text().trim() || null;
  return { id, title, thumb, fullImage, alt, description: description.trim(), credit };
}

module.exports = hubbleDetail;
