const axios = require('axios');

module.exports = function(app) {
    const rateLimit = {};
    const LIMIT = 5; // max 5 request
    const WINDOW = 60 * 60 * 1000; // 1 jam

    const sistemUrl = 'https://raw.githubusercontent.com/hazelnuttty/API/main/sistem.json';

    // 🔑 Cek API key
    async function isValidApiKey(apiKey) {
        try {
            const { data } = await axios.get(sistemUrl);
            return data.some(entry => entry.apikey === apiKey && entry.status === "active");
        } catch (err) {
            console.error('Gagal ambil sistem.json:', err.message);
            return false;
        }
    }

    // 🚦 Rate limiter
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

    // 🚀 Endpoint cosplay
    app.get('/random/cosplay', async (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        const apiKey = req.query.apikey;

        if (!apiKey) {
            return res.status(400).json({ status: false, error: 'apikey diperlukan.' });
        }

        const valid = await isValidApiKey(apiKey);
        if (!valid) {
            return res.status(403).json({ status: false, error: 'apikey tidak valid atau tidak aktif.' });
        }

        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                error: 'Rate limit exceeded. Maksimal 5 request per jam.',
            });
        }

        try {
            const response = await axios.get('https://api.nekorinn.my.id/random/cosplay', {
                responseType: 'arraybuffer'
            });

            res.writeHead(200, {
                'Content-Type': response.headers['content-type'] || 'image/jpeg',
                'Content-Length': response.data.length,
            });
            res.end(response.data);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
