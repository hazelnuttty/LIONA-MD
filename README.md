[![Hazelnuts](./media/image.jpg)](https://zelapioffciall.koyeb.app)
<p align="center">
  <img src="https://img.shields.io/badge/-Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Telegram-26A5E4?style=flat&logo=telegram&logoColor=white" alt="Telegram">
  <img src="https://img.shields.io/badge/npm_Package-CB3837?style=flat&logo=npm&logoColor=white" alt="NPM">
</p>

# Overview

Liona-MD is a modular Telegram bot framework built with Node.js, designed for simplicity and extensibility. It features a CommonJS plugin architecture that makes it accessible for beginner developers while providing powerful scraping capabilities and API integration for advanced users. The framework emphasizes clean code organization and developer-friendly patterns.

# Features

- **Plugin-Based Architecture**: Easily extendable through CJS modules.
- **Built-in Scraping Functions**: Pre-configured web scraping utilities.
- **API Integration**: Seamless connection to external services.
- **Group Management**: Built-in features for anti-link, anti-image, anti-spam, and welcome messages.
- **Developer-Friendly**: Clear code structure with comprehensive examples.
- **Cross-Platform**: Compatible with VPS and Termux environments.

# VERSION 1.0.2

- **FIX BUG ON BUTTON /SETTING**: Everyone can't use the button except admin and owner.
- **ADDED BOT FEATURE**: It allows everyone to use this script without having to have a VPS.
- **FIX BUG IN HENDLER.JS**: We have fixed handler.js so that it can be used simply.
- **ADDITION OF TWO OR MORE OWNERS SYSTEM**: This system allows bots to be handled by more than 1 owner.
- **FIX BUG IN STICKER.JS**: We have fixed the error "Error: EROFS: read-only file".

# Installation and Setup

**VPS Deployment**
```bash
# Update system and install dependencies
sudo apt update && sudo apt upgrade
sudo apt install -y git nodejs npm

# Clone repository and setup
git clone https://github.com/hazenuttty/liona-md.git
cd liona-md

# Install dependencies and start
npm install
npm start
```

**Termux Deployment (Android)**
```bash
# Update packages and install requirements
pkg update && pkg upgrade
pkg install -y git nodejs

# Clone and setup
git clone https://github.com/hazenuttty/LIONA-MD.git
cd LIONA-MD
npm install

# Launch the bot
npm start
```
*On the first run, the bot will prompt you to enter your Bot Token and Owner ID.*

# Framework Architecture

**Core Structure**
```
.
.
|-- README.md
|-- config.js
|-- database
|   |-- config.js
|   `-- config.json
|-- function
|   |-- _group.js
|   |-- _jadibot.js
|   `-- helper.js
|-- index.js
|-- lib
|   |-- autoReload.js
|   |-- cache.js
|   |-- database.js
|   |-- handler.js
|   |-- handlerJadBot.js
|   |-- jadibotDatabase.js
|   |-- login.js
|   |-- owner.js
|   `-- print.js
|-- media
|   |-- @hazeloffc
|   `-- image.jpg
|-- package.json
|-- plugins
|   |-- add.js
|   |-- addowner.js
|   |-- antiimage.js
|   |-- antilink.js
|   |-- ban.js
|   |-- cekowner.js
|   |-- claila.js
|   |-- delowner.js
|   |-- demote.js
|   |-- donghua.js
|   |-- eval.js
|   |-- exec.js
|   |-- get.js
|   |-- hadist.js
|   |-- hadistdetail.js
|   |-- hubble.js
|   |-- im.js
|   |-- jadwalsholat.js
|   |-- kick.js
|   |-- menu.js
|   |-- menubutton.js
|   |-- ping.js
|   |-- plugins.js
|   |-- promote.js
|   |-- runtime.js
|   |-- schoolhub.js
|   |-- sertifikat.js
|   |-- setmode.js
|   |-- shionai.js
|   |-- sticker.js
|   |-- tiktokmp3.js
|   |-- turnitin.js
|   `-- unban.js
|-- scrape
|   |-- baiduSearch.js
|   |-- detailHadist.js
|   |-- donghuaSchedule.js
|   |-- getPrayerSchedule.js
|   |-- hadist.js
|   |-- hubbleDetail.js
|   |-- hubbleSearch.js
|   |-- searchPrayerCity.js
|   |-- skoleAI.js
|   |-- tiktokmp3.js
|   `-- turnitin.js
|-- sessions
`-- src
    `-- main.js
```

# Code Patterns and Usage

### Scraper Function Integration
Liona-MD includes built-in scraping functions accessible through the `bot` instance:
```javascript
// plugins/exampleScraper.js
module.exports = {
  name: 'skoleai',
  aliases: ['ai'],
  async execute(bot, msg, args) {
    const question = args.join(' ');
    if (!question) return bot.sendMessage(msg.chat.id, 'Please provide a question');
    
    // Access scraper function via bot instance
    const response = await bot.skoleAI(question);
    bot.sendMessage(msg.chat.id, response);
  }
}
```

### Group Management
Group settings are managed via the `/setting` command, which provides an interactive button menu for admins.
- **/setting**: Shows the main settings menu.
- **/setting setwelcome &lt;message&gt;**: Sets a custom welcome message. Use `{user}` for the user's mention and `{group}` for the group's name.
- **/kick**: To remove members.
- **/setting setleave &lt;message&gt;**: Sets a custom leave message when a member leaves the group. Use `{user}` for the user's mention and `{group}` for the group name.

### Owner-Only Commands
Restrict commands to the bot owner using a simple validation check against `config.js`.
```javascript
// plugins/eval.js
const config = require('../config.js');

module.exports = {
  name: 'eval',
  category: 'owner',
  async execute(bot, msg, args) {
    // Validate owner identity (non-strict check for string/number)
    if (msg.from.id != config.ownerId) {
      return bot.sendMessage(msg.chat.id, 'This command is restricted to the bot owner.');
    }
    // ... command logic
  }
};
```

# Support

For technical support and development questions, contact the developer:
- **Telegram**: [HAZELOFFC](t.me/hazeloffc)
- **GitHub**: [hazelnuttty](https://github.com/hazelnuttty)
- **LIONA-MD** [LIONA-MD](t.me/hazeloffc)

---
*Liona-MD is maintained as an open-source project. Contributions and feedback are welcome to improve the framework's capabilities and documentation.*
