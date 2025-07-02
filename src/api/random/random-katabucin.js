const axios = require('axios');

module.exports = function(app) {
    async function getRandomKata() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/MichaelAgam23/metadata/refs/heads/main/katabucin.txt');
            const list = Array.isArray(data) ? data : JSON.parse(data); // handle string JSON
            const randomText = list[Math.floor(Math.random() * list.length)];
            return randomText;
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/katabucin', async (req, res) => {
        try {
            const result = await getRandomKata();
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
