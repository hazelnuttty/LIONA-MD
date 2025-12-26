const axios = require('axios');
const fs = require('fs');
const path = require('path');

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = {
  name: 'get',
  category: 'tools',
  description: 'Fetch content from a URL.',
  async execute(bot, msg, args) {
    const { chat } = msg;
    const url = args[0];

    if (!url) {
      return bot.sendMessage(chat.id, 'Please provide a URL. Usage: .get <url>');
    }

    try {
      await bot.sendMessage(chat.id, `⬇️ Fetching content from URL...`);

      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'arraybuffer',
        validateStatus: () => true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const contentType = response.headers['content-type'] || '';
      const data = Buffer.from(response.data);

      if (contentType.startsWith('image/')) {

        await bot.sendPhoto(chat.id, data, {
          caption: `🖼️ Image from ${url}`
        });
      }

      else if (contentType.includes('application/json')) {
        const jsonString = data.toString('utf8');
        try {
          const parsedJson = JSON.parse(jsonString);
          const formattedJson = JSON.stringify(parsedJson, null, 2);
          
          const message = `<b>JSON Content from ${url}</b>\n\n<blockquote><pre>${escapeHtml(formattedJson)}</pre></blockquote>`;
          
          if (message.length > 4096) {
            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            
            const filePath = path.join(tempDir, `response_${Date.now()}.json`);
            fs.writeFileSync(filePath, formattedJson);
            await bot.sendDocument(chat.id, filePath, {
              caption: `JSON content from ${url}`
            });
            fs.unlinkSync(filePath);
          } else {
            await bot.sendMessage(chat.id, message, {
              parse_mode: 'HTML',
              disable_web_page_preview: true
            });
          }
        } catch (e) {
          // Jika gagal parse JSON, kirim sebagai file
          const tempDir = path.join(__dirname, '..', 'temp');
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
          
          const filePath = path.join(tempDir, `response_${Date.now()}.json`);
          fs.writeFileSync(filePath, jsonString);
          await bot.sendDocument(chat.id, filePath, {
            caption: `Content from ${url}`
          });
          fs.unlinkSync(filePath);
        }
      }

      else if (contentType.includes('text/') || contentType.includes('application/xml')) {
        const textContent = data.toString('utf8');
        const message = `<b>Text Content from ${url}</b>\n\n<blockquote><pre>${escapeHtml(textContent.substring(0, 3000))}</pre></blockquote>`;
        
        if (message.length > 4096 || textContent.length > 3000) {
          const tempDir = path.join(__dirname, '..', 'temp');
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
          
          let fileName = `response_${Date.now()}`;
          if (contentType.includes('text/html')) {
            fileName += '.html';
          } else if (contentType.includes('application/xml')) {
            fileName += '.xml';
          } else {
            fileName += '.txt';
          }
          
          const filePath = path.join(tempDir, fileName);
          fs.writeFileSync(filePath, textContent);
          await bot.sendDocument(chat.id, filePath, {
            caption: `Content from ${url}`
          });
          fs.unlinkSync(filePath);
        } else {
          await bot.sendMessage(chat.id, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
          });
        }
      }
      
      else {
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        let extension = '.bin';
        if (contentType.includes('application/pdf')) {
          extension = '.pdf';
        } else if (contentType.includes('application/zip')) {
          extension = '.zip';
        } else if (contentType.includes('audio/')) {
          extension = '.mp3';
        } else if (contentType.includes('video/')) {
          extension = '.mp4';
        }
        
        const fileName = `response_${Date.now()}${extension}`;
        const filePath = path.join(tempDir, fileName);
        
        fs.writeFileSync(filePath, data);
        await bot.sendDocument(chat.id, filePath, {
          caption: `Content from ${url} (${contentType})`
        });
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      await bot.sendMessage(chat.id, `❌ Failed to fetch content. Error: ${error.message}`, { parse_mode: 'Markdown' });
    }
  }
};