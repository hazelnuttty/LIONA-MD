const axios = require("axios");

async function ngl(link, text) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await axios.get('https://api.siputzx.my.id/api/tools/ngl', {
                params: {
                    link,
                    text
                }
            });
            resolve(res.data);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = function(app) {
    app.get('/tools/ngl', async (req, res) => {
        const { link, text } = req.query;

        if (!link || !text) {
            return res.json({ 
                status: false,
                creator: 'Hazel',
                user: link || null,
                pesan: text || null,
                result: 'link and text are required'
            });
        }

        try {
            const hasil = await ngl(link, text);
            res.status(200).json({
                status: true,
                creator: 'Hazel',
                user: link,
                pesan: text,
                result: hasil
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                creator: 'Hazel',
                user: link,
                pesan: text,
                result: error.message
            });
        }
    });
};
