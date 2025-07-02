const axios = require('axios');

module.exports = function(app) {
    async function getRandomMotivasiIslam() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/rooxJSphire/rawFitur/main/IslamMotivasi.json');
            const list = Array.isArray(data) ? data : [];
            const randomQuote = list[Math.floor(Math.random() * list.length)];
            return randomQuote;
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/motivasi-islam', async (req, res) => {
        try {
            const result = await getRandomMotivasiIslam();
            res.json({
                status: true,
                creator: 'Hazel',
                motivasi: {
                    arab: result.ARAB,
                    latin: result.LATIN,
                    arti: result.ARTI
                }
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Error: ${error.message}`
            });
        }
    });
};
