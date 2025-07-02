const axios = require('axios');
const path = require('path');

module.exports = function(app) {
    const rateLimit = {};
    const LIMIT = 5;
    const WINDOW = 60 * 60 * 1000;

    const sistemUrl = 'https://raw.githubusercontent.com/hazelnuttty/API/main/sistem.json';
    const sourcePaptt = 'https://raw.githubusercontent.com/hazelnuttty/API/main/paptt.json';

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

    async function getRandomPaptt() {
        const { data } = await axios.get(sourcePaptt);
        const list = Array.isArray(data) ? data : data.urls || [];
        const randomUrl = list[Math.floor(Math.random() * list.length)];
        const ext = path.extname(randomUrl).toLowerCase();

        const response = await axios.get(randomUrl, { responseType: 'arraybuffer' });

        return {
            buffer: Buffer.from(response.data),
            contentType:
                ext === '.mp4' ? 'video/mp4' :
                ext === '.png' ? 'image/png' :
                ext === '.webp' ? 'image/webp' :
                'image/jpeg'
        };
    }

    app.get('/random/paptt', async (req, res) => {
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
            const { buffer, contentType } = await getRandomPaptt();
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
