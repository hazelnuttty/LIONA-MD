const axios = require("axios");
const cheerio = require("cheerio");

function formatCountdown(seconds) {
  if (!seconds || seconds < 0) return null;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  let res = "";
  if (d > 0) res += `${d}d `;
  if (h > 0) res += `${h}h `;
  if (m > 0) res += `${m}m`;
  return res.trim() || "Soon";
}

async function donghuaSchedule() {
  const { data } = await axios.get("https://donghub.vip/schedule/", {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 10000
  });
  const $ = cheerio.load(data);
  const results = {};
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  days.forEach((day) => {
    results[day] = [];
    $(`.sch_${day} .bsx`).each((_, el) => {
      const title = $(el).find(".tt").text().trim();
      const link = $(el).find("a").attr("href");
      const episode = $(el).find(".sb.Sub").text().trim();
      const status = $(el).find(".epx").text().trim();
      const img = $(el).find("img").attr("src");
      let countdown = null;
      const countdownElem = $(el).find(".epx.cndwn");
      if (countdownElem.length) {
        const cndwnData = countdownElem.attr("data-cndwn");
        if (cndwnData) countdown = formatCountdown(parseInt(cndwnData));
      }
      results[day].push({
        title: title || "No Title",
        link: link || null,
        episode: episode || "Unknown",
        status: status || "Unknown",
        countdown,
        img: img || null
      });
    });
  });
  const totalDonghua = Object.values(results).reduce((total, dayDonghua) => total + dayDonghua.length, 0);
  const dayNames = {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday"
  };
  return { totalDonghua, scrapedAt: new Date().toLocaleString("id-ID"), days: dayNames, results };
}

module.exports = donghuaSchedule;
