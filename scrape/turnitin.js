const axios = require("axios");

async function turnitin(text) {
  const { data } = await axios.post(
    "https://reilaa.com/api/turnitin-match",
    { text },
    { headers: { "Content-Type": "application/json" } }
  );
  if (!data?.reilaaResult?.value) throw new Error("Hasil tidak ditemukan atau kosong");
  return data.reilaaResult.value;
}

module.exports = turnitin;
