const axios = require('axios');

module.exports = function (app) {
  app.get('/tools/domain', async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.json({ status: false, error: 'Query is required, contoh: ?q=example.com' });
    }

    try {
      // Step 1: Resolve domain ke IP
      const ipLookup = await axios.get(`https://dns.google/resolve?name=${encodeURIComponent(q)}&type=A`);
      const ip = ipLookup.data.Answer?.[0]?.data;

      if (!ip) {
        return res.status(404).json({ status: false, message: 'Domain tidak ditemukan atau tidak valid.' });
      }

      // Step 2: Cari info IP pakai ipwho.is
      const whoisURL = `https://ipwho.is/${ip}`;
      const { data } = await axios.get(whoisURL);

      const modified = {
        creator: 'Hazel', // nama kamu
        domain: q,
        ip: ip,
        isp: data.connection?.isp,
        org: data.connection?.org,
        country: data.country,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude,
        location_url: `https://www.google.com/maps?q=${data.latitude},${data.longitude}`,
        asn: data.connection?.asn,
        type: data.type,
        success: data.success
      };

      res.json(modified);
    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal mengambil data domain', error: e.message });
    }
  });
};
