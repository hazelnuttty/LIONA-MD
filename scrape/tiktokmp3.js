const axios = require("axios");

async function tiktokmp3(url) {
  if (!url) throw new Error("URL required");
  const { data } = await axios.post(
    "https://ttsave.app/download",
    { query: url, language_id: "2" },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    }
  );
  const match = /href=\"(https:\/\/v16-ies-music.tiktokcdn.com\/[^\"]+)\"/g.exec(data);
  if (!match) throw new Error("Audio link not found");
  return match[1];
}

module.exports = tiktokmp3;
