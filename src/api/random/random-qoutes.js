const axios = require('axios');

module.exports = function(app) {
    async function getRandomQuote() {
        try {
            const { data } = await axios.get('https://api.dikaardnt.com/random/quotes');
            return data;
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/quotes', async (req, res) => {
        try {
            const result = await getRandomQuote();
            res.json({
                status: true,
                creator: 'Hazel',
                character: result.character,
                content: result.content,
                info: result.status,
                timeDate: result.timeDate
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Error: ${error.message}`
            });
        }
    });
};
