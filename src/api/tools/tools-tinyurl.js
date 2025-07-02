const axios = require("axios");

async function shortUrl(links) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await axios.get('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(links));
            resolve(res.data.toString());
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = function(app) {
    app.get('/tools/tinyurl', async (req, res) => {
        const url = req.query.url; // ambil url dari query parameter

        if (!url) {
            return res.json({ status: false, error: 'Url is required' });
        }

        try {
            const anu = await shortUrl(url);
            res.status(200).json({
                status: true,
                result: anu
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};