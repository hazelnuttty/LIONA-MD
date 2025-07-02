const axios = require('axios');

module.exports = function (app) {
    const rateLimit = {};
    const LIMIT = 5; // max 5 request per jam
    const WINDOW = 60 * 60 * 1000;

    const sistemUrl = 'https://raw.githubusercontent.com/hazelnuttty/API/main/sistem.json';

    // 🔐 Cek API Key dari sistem.json
    async function isValidApiKey(apiKey) {
        try {
            const { data } = await axios.get(sistemUrl);
            return data.some(entry => entry.apikey === apiKey && entry.status === "active");
        } catch (err) {
            console.error('Gagal ambil sistem.json:', err.message);
            return false;
        }
    }

    // 🧠 Cek rate limit berdasarkan IP
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

    // 📺 Ambil data IDN Live
    async function getJKT48LiveList() {
        const { data } = await axios.get("https://48intensapi.my.id/api/idnlive/jkt48");
        return data.data || [];
    }

    // ✅ Endpoint: /idnlive/jkt48
    app.get('/idnlive/jkt48', async (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        const apiKey = req.query.apikey;

        // 🔑 Cek API key
        if (!apiKey) return res.status(400).json({ status: false, error: 'apikey diperlukan.' });

        const valid = await isValidApiKey(apiKey);
        if (!valid) return res.status(403).json({ status: false, error: 'apikey tidak valid atau tidak aktif.' });

        // 🚫 Cek rate limit
        if (isRateLimited(ip)) {
            return res.status(429).json({
                status: false,
                error: 'Rate limit exceeded. Maksimal 5 request per jam.',
            });
        }

        try {
            const liveList = await getJKT48LiveList();

            if (liveList.length === 0) {
                return res.json({
                    status: true,
                    message: "Tidak ada member JKT48 yang sedang live saat ini.",
                    data: []
                });
            }

            const hasil = liveList.map(mbr => {
                const nama = mbr.user.name;
                const username = mbr.user.username;
                const judul = mbr.title;
                const viewers = mbr.view_count;

                // konversi waktu ISO ke WIB
                const waktuObj = new Date(mbr.live_at);
                const waktuWIB = new Date(waktuObj.getTime() + 7 * 60 * 60 * 1000);
                const waktuFormatted = waktuWIB.toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                const link = `https://www.idn.app/${username}/live/${mbr.slug}`;
                const img = mbr.image;

                return { nama, username, judul, viewers, waktu: waktuFormatted, link, img };
            });

            res.json({
                status: true,
                total: hasil.length,
                data: hasil
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                error: 'Gagal mengambil data live JKT48.',
                message: error.message
            });
        }
    });
};
