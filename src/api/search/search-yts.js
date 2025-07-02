const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function (app) {
    app.get('/search/lyrics', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.json({
                status: false,
                creator: "Hazel",
                error: "Query is required"
            });
        }

        const sources = [
            scrapeGenius,
            scrapeLyricsFreak,
            scrapeKapanLagi
        ];

        for (const source of sources) {
            try {
                const result = await source(q);
                if (result) {
                    return res.json({
                        status: true,
                        creator: "Hazel",
                        result
                    });
                }
            } catch (e) {
                console.log(`Gagal dari ${source.name}: ${e.message}`);
                continue;
            }
        }

        res.json({
            status: false,
            creator: "Hazel",
            error: "Lyrics not found in all sources."
        });
    });
};

async function scrapeGenius(query) {
    const searchUrl = `https://genius.com/api/search/multi?per_page=1&q=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl);
    const section = searchRes.data.response.sections.find(s => s.type === 'song');
    const hit = section?.hits[0];
    if (!hit) return null;

    const songUrl = hit.result.url;
    const pageRes = await axios.get(songUrl);
    const $ = cheerio.load(pageRes.data);
    const lyrics = $('[data-lyrics-container="true"]').text().trim();

    return {
        title: hit.result.full_title,
        artist: hit.result.primary_artist.name,
        lyrics,
        source: songUrl
    };
}

async function scrapeLyricsFreak(query) {
    const searchUrl = `https://www.lyricsfreak.com/search.php?a=search&type=song&q=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl);
    const $ = cheerio.load(searchRes.data);
    const firstLink = $('.song a').attr('href');
    if (!firstLink) return null;

    const fullUrl = `https://www.lyricsfreak.com${firstLink}`;
    const pageRes = await axios.get(fullUrl);
    const $$ = cheerio.load(pageRes.data);
    const lyrics = $$('.lyrictxt.js-lyrics.js-share-text-content').text().trim();

    return {
        title: $$('.breadcrumb li').eq(2).text(),
        artist: $$('.breadcrumb li').eq(1).text(),
        lyrics,
        source: fullUrl
    };
}

async function scrapeKapanLagi(query) {
    const searchUrl = `https://lirik.kapanlagi.com/cari/?q=${encodeURIComponent(query)}`;
    const res = await axios.get(searchUrl);
    const $ = cheerio.load(res.data);
    const link = $('.box-lirik ul li a').attr('href');
    if (!link) return null;

    const pageRes = await axios.get(link);
    const $$ = cheerio.load(pageRes.data);
    const lyrics = $$('.lirik_lagu').text().trim();

    return {
        title: $$('h1').text().trim(),
        artist: $$('h2').text().replace('Lirik Lagu', '').trim(),
        lyrics,
        source: link
    };
}
