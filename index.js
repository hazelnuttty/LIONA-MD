const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;
app.enable("trust proxy");
app.set("json spaces", 2);

// === SETTINGS ===
const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

const discordWebhookURL = 'https://discord.com/api/webhooks/1388578723791376385/wwX9g6pl5oZITfbF3aezRf0u-SO6IGmyKMXYzu-r-YW9IO-S4A4c6KfKEves4PbI0uu0';

// === LIMIT SETTINGS ===
const RATE_LIMIT = 5;
const WINDOW_TIME = 5 * 1000;
const BAN_TIME = 35 * 60 * 1000;
const ipRequests = new Map(); // key = `${ip}_${endpoint}`
const bannedIPs = new Map();  // key = `${ip}_${endpoint}`

// === WHITELIST IP ===
let whitelistedIPs = [];

async function loadWhitelist() {
  try {
    const { data } = await axios.get('https://raw.githubusercontent.com/hazelnuttty/API/main/whitelist.json');
    if (Array.isArray(data)) {
      whitelistedIPs = data;
      console.log(chalk.green(`[Whitelist Loaded] ${whitelistedIPs.length} IPs`));
    } else {
      console.error('[Whitelist Error] Format JSON bukan array');
    }
  } catch (err) {
    console.error('[Whitelist Load Error]', err.message);
  }
}

loadWhitelist();
setInterval(loadWhitelist, 10 * 1000); // refresh whitelist tiap 5 menit

// === BLACKLIST IP ===
let blacklistedIPs = [];

async function loadBlacklist() {
  try {
    const { data } = await axios.get('https://raw.githubusercontent.com/hazelnuttty/API/main/blacklist.json');
    if (Array.isArray(data)) {
      blacklistedIPs = data;
      console.log(chalk.red(`[Blacklist Loaded] ${blacklistedIPs.length} IPs`));
    } else {
      console.error('[Blacklist Error] Format JSON bukan array');
    }
  } catch (err) {
    console.error('[Blacklist Load Error]', err.message);
  }
}
loadBlacklist();
setInterval(loadBlacklist, 10 * 1000); 
// === WEBHOOK LOGGER ===
function sendDiscordAlert({ ip, endpoint, ddosTime, banEndTime, headers }) {
  const embed = {
    title: "🚨 DDoS Detected",
    color: 0xff0000,
    fields: [
      { name: "IP", value: ip, inline: true },
      { name: "Endpoint", value: endpoint, inline: true },
      { name: "Time", value: ddosTime, inline: false },
      { name: "Ban Until", value: banEndTime, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Hazel Anti-DDoS System" }
  };

  return axios.post(discordWebhookURL, {
    content: "⚠️ Suspicious Traffic Detected",
    embeds: [embed]
  }).catch(err => {
    console.error('[Webhook Failed]', err.message);
  });
}

function sendRawRequestLog({ ip, path, headers }) {
  return axios.post(discordWebhookURL, {
    content: `📩 Blocked Request:\nIP: ${ip}\nPath: ${path}\nHeaders:\n\`\`\`json\n${JSON.stringify(headers, null, 2)}\n\`\`\``
  }).catch(() => {});
}

// === ANTI-DDOS MIDDLEWARE ===
app.use((req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const endpoint = req.originalUrl;
  const now = Date.now();
  const key = `${ip}_${endpoint}`;

  if (whitelistedIPs.includes(ip)) return next();
  if (blacklistedIPs.includes(ip)) {
     return res.status(403).json({
       status: false,
       antiddos: true,
       blocked: true,
       permanent: true,
       ip,
       message: "🚫 Akses ditolak. IP kamu masuk daftar hitam.",
       reason: "IP ini diblacklist permanen oleh admin."
      });
   }
  if (bannedIPs.has(key)) {
    const banEnd = bannedIPs.get(key);
    if (now < banEnd) {
      sendRawRequestLog({ ip, path: endpoint, headers: req.headers });
      return res.status(403).json({
        status: false,
        antiddos: true,
        blocked: true,
        ip,
        endpoint,
        until: new Date(banEnd).toISOString(),
        message: "🚫 Akses endpoint ini diblokir sementara.",
        reason: "Terlalu sering mengakses endpoint ini."
      });
    } else {
      bannedIPs.delete(key);
    }
  }

  const requestData = ipRequests.get(key) || { count: 0, startTime: now };
  if (now - requestData.startTime < WINDOW_TIME) {
    requestData.count++;
  } else {
    requestData.count = 1;
    requestData.startTime = now;
  }
  ipRequests.set(key, requestData);

  if (requestData.count > RATE_LIMIT) {
    const banEndTime = now + BAN_TIME;
    bannedIPs.set(key, banEndTime);

    sendDiscordAlert({
      ip,
      endpoint,
      ddosTime: new Date(now).toLocaleString(),
      banEndTime: new Date(banEndTime).toLocaleString(),
      headers: req.headers
    });

    console.log(chalk.red(`[DDoS Blocked] ${ip} @ ${endpoint}`));
    return res.status(429).json({
      status: false,
      antiddos: true,
      blocked: true,
      ip,
      endpoint,
      until: new Date(banEndTime).toISOString(),
      message: "🚫 Kamu terlalu sering request ke endpoint ini.",
      reason: "Deteksi DDoS lokal pada route ini."
    });
  }

  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      const wrapped = {
        status: data.status ?? true,
        creator: settings.apiSettings.creator || "Hazel",
        ...data
      };
      return originalJson.call(this, wrapped);
    }
    return originalJson.call(this, data);
  };

  next();
});

// === AUTO CLEANUP CACHE ===
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ipRequests.entries()) {
    if (now - value.startTime > WINDOW_TIME) {
      ipRequests.delete(key);
    }
  }
  for (const [key, until] of bannedIPs.entries()) {
    if (now > until) {
      bannedIPs.delete(key);
    }
  }
}, 60 * 1000);

// === MIDDLEWARE LAINNYA ===
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// === STATIC FILES ===
app.use('/', express.static(path.join(__dirname, 'home')));
app.use('/api-page', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// === LOAD ROUTES ===
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
  const subfolderPath = path.join(apiFolder, subfolder);
  if (fs.statSync(subfolderPath).isDirectory()) {
    fs.readdirSync(subfolderPath).forEach((file) => {
      const filePath = path.join(subfolderPath, file);
      if (path.extname(file) === '.js') {
        require(filePath)(app);
        totalRoutes++;
        console.log(chalk.bgHex('#FFFF99').hex('#333')(` Loaded: ${file} `));
      }
    });
  }
});
console.log(chalk.bgGreen.hex('#000')(` ✅ Loaded ${totalRoutes} routes `));

// === HOMEPAGE ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// === 404 ===
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'api-page', 'akses.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(chalk.bgGreen.hex('#000')(` 🚀 Server Running at Port ${PORT} `));
});

module.exports = app;
