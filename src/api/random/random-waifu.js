const axios = require('axios');

module.exports = function(app) {
    async function waifu() {
        try {
            const { data } = await axios.get(`https://raw.githubusercontent.com/hazelnuttty/API/refs/heads/main/waifu.json`);
            const urls = Array.isArray(data) ? data : data.urls;
            const randomUrl = urls[Math.floor(Math.random() * urls.length)];
            const response = await axios.get(randomUrl, { responseType: 'arraybuffer' });
            return {
                buffer: Buffer.from(response.data),
                contentType: response.headers['content-type'] || 'image/png'
            };
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/waifu', async (req, res) => {
        try {
            const { buffer, contentType } = await waifu();
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
