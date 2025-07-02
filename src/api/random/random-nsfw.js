const axios = require('axios');

module.exports = function (app) {
    const rateLimit = {};
    const LIMIT = 5;
    const WINDOW = 60 * 60 * 1000;

    const sistemUrl = 'https://raw.githubusercontent.com/hazelnuttty/API/main/sistem.json';

    async function isValidApiKey(apiKey) {
        try {
            const { data } = await axios.get(sistemUrl);
            return data.some(entry => entry.apikey === apiKey && entry.status === "active");
        } catch (err) {
            console.error('Gagal ambil sistem.json:', err.message);
            return false;
        }
    }

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

    async function fetchFromFlowFalcon() {
        const { data } = await axios.get('https://flowfalcon.dpdns.org/random/nsfw', {
            responseType: 'arraybuffer'
        });

        const contentType = 'image/jpeg'; // Jika kamu tahu pasti ini bisa image/png/webp, sesuaikan
        return {
            buffer: Buffer.from(data),
            contentType
        };
    }

    app.get('/random/nsfw', async (req, res) => {
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
            const { buffer, contentType } = await fetchFromFlowFalcon();
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': buffer.length,
            });
            res.end(buffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
