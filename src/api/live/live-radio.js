const axios = require('axios');

module.exports = function (app) {
    const rateLimit = {};
    const LIMIT = 5;
    const WINDOW = 60 * 60 * 1000;

    function isRateLimited(ip) {
        const now = Date.now();
        if (!rateLimit[ip]) {
            rateLimit[ip] = { count: 1, start: now };
            return false;
        }

        const { count, start } = rateLimit[ip];
        if (now - start > WINDOW) {
            rateLimit[ip] = { count: 1, start: now };
            return false;
        }

        if (count >= LIMIT) return true;

        rateLimit[ip].count++;
        return false;
    }

    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    async function getRadioByCountry(country) {
        const url = `https://de1.api.radio-browser.info/json/stations/search?country=${encodeURIComponent(country)}`;
        const { data } = await axios.get(url);
        return data;
    }

    app.get('/live/radio', async (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        let country = req.query.country;

        if (!country) {
            return res.status(400).json({
                status: false,
                author: 'Hazelnut API',
                error: 'Parameter ?country= wajib diisi.'
            });
        }

        // Ubah ke Title Case
        country = toTitleCase(country);

        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                author: 'Hazelnut API',
                error: 'Rate limit exceeded. Maksimal 5 request per jam.'
            });
        }

        try {
            const result = await getRadioByCountry(country);

            if (!result || result.length === 0) {
                return res.json({
                    status: true,
                    author: 'Hazelnut API',
                    message: `Tidak ada stasiun radio dari negara ${country} yang ditemukan.`,
                    data: []
                });
            }

            const output = result.slice(0, 4).map(station => ({
                nama: station.name,
                url: station.url_resolved,
                favicon: station.favicon,
                negara: station.country,
                kota: station.state,
                bahasa: station.language,
                tag: station.tags
            }));

            res.json({
                status: true,
                author: 'Hazelnut API',
                total: output.length,
                data: output
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                author: 'Hazelnut API',
                error: 'Gagal mengambil data radio.',
                message: error.message
            });
        }
    });
};
