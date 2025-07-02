const axios = require('axios');

module.exports = function(app) {
    app.get('/random/picre', async (req, res) => {
        try {
            const response = await axios.get('https://api.nekorinn.my.id/random/picre', {
                responseType: 'arraybuffer'
            });

            res.writeHead(200, {
                'Content-Type': response.headers['content-type'] || 'image/jpeg',
                'Content-Length': response.data.length,
            });
            res.end(response.data);
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Error: ${error.message}`
            });
        }
    });
};
