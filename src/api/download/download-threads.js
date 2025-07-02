const axios = require('axios');

module.exports = function (app) {
  app.get('/download/thread', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'Parameter URL diperlukan. Contoh: ?url=https://www.threads.net/xxxxx'
      });
    }

    const threadsUrlPattern = /^https:\/\/(www\.)?threads\.net\/@[^\/]+\/post\/[A-Za-z0-9_-]+(\?.*)?$/;
    
    if (!threadsUrlPattern.test(url)) {
      return res.status(400).json({
        status: false,
        message: 'Format URL Threads tidak valid. Gunakan format: https://www.threads.net/@username/post/postid'
      });
    }

    try {
      //request yang lebih robust, ini konfigurasi 
      const apiURL = 'https://velyn.biz.id/api/downloader/threads';
      const response = await axios.get(apiURL, {
        params: { url },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
          'Referer': 'https://www.threads.net/'
        },
        timeout: 30000, //ini timeout kimak
        validateStatus: function (status) {
          return status >= 200 && status < 300; //hanya terima status 2xx
        }
      });

      const data = response.data;

      if (!data) {
        return res.status(502).json({
          status: false,
          message: 'Response kosong dari API eksternal'
        });
      }
      if (data.status === false) {
        return res.status(400).json({
          status: false,
          message: data.message || 'Gagal memproses URL Threads',
          creator: 'Hazel'
        });
      }
      res.json({
        status: true,
        ...data,
        creator: 'Hazel',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error in threads downloader:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        return res.status(503).json({
          status: false,
          message: 'Layanan API eksternal tidak tersedia saat ini',
          creator: 'Hazel'
        });
      }

      if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
        return res.status(504).json({
          status: false,
          message: 'Request timeout - coba lagi dalam beberapa saat',
          creator: 'Hazel'
        });
      }

      if (err.response) {
        const statusCode = err.response.status;
        const errorMessage = err.response.data?.message || 'Error dari API eksternal';
        
        return res.status(statusCode >= 400 && statusCode < 500 ? 400 : 502).json({
          status: false,
          message: errorMessage,
          httpStatus: statusCode,
          creator: 'Hazel'
        });
      }

      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan internal server',
        creator: 'Hazel'
      });
    }
  });
};
