const axios = require('axios');

module.exports = function(app) {
    async function getRandomMotivasiKristen() {
        try {
            const { data } = await axios.get('https://raw.githubusercontent.com/hazelnuttty/API/main/motivasikristen.json');
            const list = Array.isArray(data) ? data : [];
            const randomQuote = list[Math.floor(Math.random() * list.length)];
            return randomQuote;
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/motivasi-kristen', async (req, res) => {
        try {
            const result = await getRandomMotivasiKristen();
            res.json({
                status: true,
                creator: 'Hazel',
                motivasi: {
                    ayat: result.AYAT,
                    kitab: result.KITAB,
                    artinya: result.ARTINYA
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
