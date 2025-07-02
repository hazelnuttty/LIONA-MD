const axios = require('axios');

async function getGempa() {
  try {
    const response = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
    return response.data.Infogempa.gempa;
  } catch (e) {
    throw new Error('Gagal mengambil data gempa dari BMKG');
  }
}

module.exports = function(app) {
app.get('/info/cekgempa', async (req, res) => {
    try {
      const data = await getGempa();
      res.json({
        status: true,
        result: {
          lokasi: data.Wilayah,
          waktu: data.Tanggal + ' ' + data.Jam,
          magnitude: data.Magnitude,
          kedalaman: data.Kedalaman,
          koordinat: data.Coordinates,
          potensi: data.Potensi,
          dirasakan: data.Dirasakan || 'Tidak ada informasi dirasakan',
          peta: data.Shakemap ? `https://data.bmkg.go.id/DataMKG/TEWS/${data.Shakemap}` : null
        }
      });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  });
};
