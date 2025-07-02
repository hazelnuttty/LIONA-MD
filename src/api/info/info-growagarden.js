const axios = require('axios');

module.exports = function(app) {
    app.get('/info/growagarden', async (req, res) => {
        try {
            const response = await axios.get('https://zenzxz.dpdns.org/info/growagardenstock');

            const original = response.data;

            const modified = {
                status: original.status,
                author: 'Hazel', // hanya pakai author
                count: original.count,
                data: original.data
            };

            res.status(200).json(modified);
        } catch (error) {
            res.status(500).json({
                status: false,
                author: 'Hazel',
                message: `Error: ${error.message}`
            });
        }
    });
};
