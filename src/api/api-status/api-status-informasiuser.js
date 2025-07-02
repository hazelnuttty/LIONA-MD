const axios = require('axios');
const crypto = require('crypto');

let totalRequest = 0;

module.exports = function (app) {
  app.use((req, res, next) => {
    totalRequest++;
    next();
  });

  function getRealIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  }

  function getRandomUserId(ip) {
    return crypto.createHash('md5').update(ip).digest('hex').slice(0, 10);
  }

  app.get('/api-status/informasiuser', async (req, res) => {
    try {
      const ip = getRealIp(req);
      const userId = getRandomUserId(ip);

      // ambil data lokasi dari ipwho.is
      const geo = await axios.get(`https://ipwho.is/${ip}`);
      const geoData = geo.data;

      res.json({
        status: true,
        creator: 'Hazel',
        result: {
          antiddos: 'Aktif',
          userid: userId,
          alamatip: ip,
          negara: geoData.country || 'Unknown',
          kota: geoData.city || 'Unknown',
          isp: geoData.connection?.isp || 'Unknown',
          totalrequest: totalRequest.toString()
        }
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil status',
        error: e.message
      });
    }
  });
};
