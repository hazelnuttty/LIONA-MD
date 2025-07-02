const axios = require('axios');

const SUPABASE_URL = 'https://cxdjoetjwtpaflqgehig.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // [disingkat untuk keamanan]

const supabaseHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
};

let totalRequest = 0;
let totalSuccess = 0;
let totalError = 0;
let totalResponseTime = 0;

const deployTimestamp = new Date('2025-06-05T03:00:00Z');
let serverRegion = 'unknown';

(async () => {
  try {
    const res = await axios.get('https://www.cloudflare.com/cdn-cgi/trace');
    const data = Object.fromEntries(res.data.trim().split('\n').map(line => line.split('=')));
    serverRegion = data.loc || 'unknown';
  } catch {
    serverRegion = 'unknown';
  }
})();

// Inisialisasi total request dari Supabase
(async () => {
  try {
    const res = await axios.get(`${SUPABASE_URL}/rest/v1/request_counter?id=eq.1&select=data`, {
      headers: supabaseHeaders,
    });

    if (res.data.length > 0 && res.data[0].data) {
      totalRequest = res.data[0].data.count || 0;
    } else {
      await axios.post(
        `${SUPABASE_URL}/rest/v1/request_counter`,
        { id: 1, data: { count: 0 } },
        { headers: supabaseHeaders }
      );
    }
  } catch (e) {
    console.error('Gagal ambil data awal dari Supabase:', e.message);
  }
})();

module.exports = function (app) {
  app.use(async (req, res, next) => {
    const startTime = Date.now();
    totalRequest++;

    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      totalResponseTime += duration;

      if (res.statusCode < 400) {
        totalSuccess++;
      } else {
        totalError++;
      }

      try {
        await axios.patch(
          `${SUPABASE_URL}/rest/v1/request_counter?id=eq.1`,
          { data: { count: totalRequest } },
          { headers: supabaseHeaders }
        );
      } catch (e) {
        console.error('Gagal update count ke Supabase:', e.message);
      }
    });

    next();
  });

  function countRoutes() {
    let routeCount = 0;
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        routeCount++;
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) routeCount++;
        });
      }
    });
    return routeCount;
  }

  function formatRuntime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}j ${mins}m ${secs}s`;
  }

  async function testSpeed() {
    const start = Date.now();
    try {
      await axios.get('https://www.google.com/generate_204', { timeout: 3000 });
      return `${Date.now() - start} ms`;
    } catch {
      return 'timeout';
    }
  }

  app.get('/api-status/status', async (req, res) => {
    try {
      const runtime = Date.now() - deployTimestamp.getTime();
      const domain = req.hostname;
      const totalfitur = countRoutes();
      const speed = await testSpeed();

      const avgResponseTime = totalRequest > 0 ? `${(totalResponseTime / totalRequest).toFixed(2)} ms` : '0 ms';
      const successRate = totalRequest > 0 ? `${((totalSuccess / totalRequest) * 100).toFixed(2)}%` : '0%';
      const errorRate = totalRequest > 0 ? `${((totalError / totalRequest) * 100).toFixed(2)}%` : '0%';

      res.json({
        status: true,
        creator: 'Hazel',
        result: {
          status: 'Aktif',
          totalrequest: totalRequest.toString(),
          totalfitur,
          runtime: formatRuntime(runtime),
          speed,
          avgResponseTime,
          successRate,
          errorRate,
          region: serverRegion,
          domain
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
