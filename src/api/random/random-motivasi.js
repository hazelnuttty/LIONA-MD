const axios = require('axios');

module.exports = function(app) {
    async function getRandomMotivasi() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/rooxJSphire/rawFitur/refs/heads/main/motivasi.json');
            const list = Array.isArray(data) ? data : data.kata;
            const randomText = list[Math.floor(Math.random() * list.length)];
            return randomText;
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/motivasi', async (req, res) => {
        try {
            const result = await getRandomMotivasi();
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
