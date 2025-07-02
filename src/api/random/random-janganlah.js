const axios = require('axios');

module.exports = function(app) {
    async function getRandomJanganlah() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/rooxJSphire/rawFitur/refs/heads/main/janganlah.json');
            const list = Array.isArray(data) ? data : data.kata;
            const randomText = list[Math.floor(Math.random() * list.length)];
            return randomText;
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/janganlah', async (req, res) => {
        try {
            const result = await getRandomJanganlah();
            res.json({
                status: true,
                creator: 'Hazel',
                message: result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Error: ${error.message}`
            });
        }
    });
};
