[![Hazelnuts](./media/image.jpg)](https://zelapioffciall.koyeb.app)
<p align="center">
  <img src="https://img.shields.io/badge/-Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="2">
  <img src="https://img.shields.io/badge/Telegram-26A5E4?style=flat&logo=telegram&logoColor=white" alt="0">
  <img src="https://img.shields.io/badge/npm_Package-CB3837?style=flat&logo=npm&logoColor=white" alt="2">
  <img src="https://img.shields.io/badge/Node-Telegram_API-339933?style=flat&logo=nodedotjs&logoColor=white" alt="5">
</p>

---
**WHY CHOOSE LIONA-MD?**

Liona is a telegram bot with a cjs plugin type that is very easy for beginner developers, Liona itself has been integrated with scrape and API.
---
**HOW TO RUN LIONA-MD**
```
// IN VPS

sudo apt update
sudo apt upgrade
sudo apt install git -y
gitclone https://github.com/hazenuttty/liona-md
cd liona-md
mv liona-md/* liona-md/.[!.]* liona-md/..?* /root/
npm install
npm start //FYI before you run, change the token and owner ID in config.js first.
```
---
**EXAMPLE CODE**
```
// EXAMPLE OF CALLING THE SCRAPER FUNCTION

module.exports = {
  name: 'skoleai',
  aliases: ['ai'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const question = args.join(' ')
    if (!question) return bot.sendMessage(chatId, 'tanya apa saja')

    const res = await bot.skoleAI(question) // THIS IS A SCRAPER CALL
    bot.sendMessage(chatId, res)
  }
}
```
``` 
// API PROVIDER CALL EXAMPLE

const axios = require('axios')
const print = require('../lib/print.js')
const config = require('../config.js')

module.exports = {
  name: 'sertifikatolol',
  aliases: [],
  category: 'canvas',
  description: 'Canvas Sertifikat Olol',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id

    try {
      const text = args.join(' ') || 'hai'
      const url = `${config.apiProvider}/canvas/sertifikatolol?text=${encodeURIComponent(text)}` //${config.apiPovider} API CALL EXAMPLE

      const res = await axios.get(url, {
        responseType: 'arraybuffer'
      })

      if (!res.data) {
        return bot.sendMessage(chatId, 'error')
      }

      await bot.sendPhoto(
        chatId,
        Buffer.from(res.data),
        { caption: 'hasil canvas' }
      )

    } catch (e) {
      print.error(e, 'Canvas SertifikatOlol Command')
      await bot.sendMessage(chatId, 'error')
    }
  }
}
```
---
**SYSTEM STRUCTURE**
```
├── config.js //CONFIG/FILE SETTING FUNCTION
├── index.js //MAIN FILE
├── lib
│   ├── autoReload.js //AUTORELOAD IF THERE ARE CHANGES IN ALL FILES
│   ├── handler.js //HANDLER BUTTON AND RUNTIME FUNCTION
│   ├── login.js //LOGIN TELEGRAM FUNCTION
│   ├── myfunction.js //SCRAPE FUNCTION
│   └── print.js
├── media
│   └── image.jpg //BANNER MENU
├── package.json //PACKAGE NODEJS
└── plugins 
    ├── claila.js
    ├── donghua.js
    ├── eval.js
    ├── exec.js
    ├── hadist.js
    ├── hadistdetail.js
    ├── hubble.js
    ├── jadwalsholat.js
    ├── menu.js
    ├── menubutton.js
    ├── ping.js
    ├── plugins.js
    ├── runtime.js
    ├── schoolhub.js
    ├── sertifikat.js
    ├── setmode.js
    ├── shionai.js
    ├── sticker.js
    ├── tiktokmp3.js
    └── turnitin.js
```
---
**CONTACT DEVELOPER**
• t.me/hazeloffc
