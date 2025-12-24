const axios = require("axios");
const vm = require("vm");
const cheerio = require("cheerio");

const hubbleDetail = require("./hubbleDetail.js");

async function hubbleSearch(query) {
  if (!query) throw new Error("Query tidak boleh kosong.");
  const { data } = await axios.get(`https://esahubble.org/images/?search=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const match = data.match(/var\s+images\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error("Gagal menemukan array images.");
  const sandbox = { images: [] };
  vm.createContext(sandbox);
  vm.runInContext("images = " + match[1], sandbox);
  const detailed = await Promise.all(
    sandbox.images.map(async (item) => {
      let id = item.url ? item.url.split("/")[item.url.split("/").length - 2] : null;
      if (!id) return item;
      const det = await hubbleDetail(id);
      return { ...item, id, detail: det };
    })
  );
  return { status: true, total: detailed.length, data: detailed[0] || null };
}

module.exports = hubbleSearch;
