const axios = require('axios');

module.exports = function(app) {
    async function waifu() {
        try {
            const { data } = await axios.get('https://api.nekorinn.my.id/random/yandere');
            const imageUrl = data.result;

            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
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
