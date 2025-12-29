[![Hazelnuts](./media/image.jpg)](https://zelapioffciall.koyeb.app)
<p align="center">
  <img src="https://img.shields.io/badge/-Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Telegram-26A5E4?style=flat&logo=telegram&logoColor=white" alt="Telegram">
  <img src="https://img.shields.io/badge/npm_Package-CB3837?style=flat&logo=npm&logoColor=white" alt="NPM">
  <br>
  <img src="https://img.shields.io/badge/-Google%20Gemini-4285F4?style=flat&logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/-Groq-5A5A5A?style=flat&logo=groq&logoColor=white" alt="Groq">
  <img src="https://img.shields.io/badge/-Cerebras-FF4F00?style=flat&logoColor=white" alt="Cerebras">
</p>

### Overview

Liona-MD is a modular Telegram bot framework built with Node.js, designed for simplicity and extensibility. It features a CommonJS plugin architecture that makes it accessible for beginner developers while providing powerful scraping capabilities and API integration for advanced users. The framework emphasizes clean code organization and developer-friendly patterns.

### Version 1.0.3 Release Notes

This version introduces significant enhancements to the AI capabilities, security, and overall user experience.

### New Features
- **Multi-Provider AutoAI**: The AutoAI system has been completely refactored to support multiple AI providers. Users can now choose between `Groq`, `Gemini`, and `Cerebras` on a per-chat basis using the `.autoai` command. The default provider is Groq.
- **Automatic Bot Updates**: The bot now includes a self-updating mechanism that pulls the latest changes from the GitHub repository, ensuring you're always running the most recent version.
- **Report Command**: A utility command that forwards user reports to the bot owner. It gathers the sender's identity and message content, sends the report to all owner accounts defined in the configuration, and returns a confirmation message to the user.
- **Configurable Leave Messages**: In addition to welcome messages, you can now set custom messages for when a user leaves a group using the `/setting setleave <message>` command.

### Security Enhancements
- **Jadibot Session Encryption**: The security of the `jadibot` feature has been significantly improved. Session files are now encrypted using AES-256 to protect sensitive data like bot tokens and owner IDs.
- **Hashed Session Filenames**: Session filenames are now generated from a SHA-256 hash of the bot token, preventing direct token exposure from the filesystem.

### Features
- **Plugin-Based Architecture**: Easily extendable through CommonJS modules.
- **Multi-Provider AI Support**: Integrates with Groq, Gemini, and Cerebras, configurable per-chat.
- **Automatic Updates**: Keeps the bot up-to-date with the latest changes from the repository.
- **Built-in Scraping Functions**: Pre-configured web scraping utilities for various tasks.
- **Advanced Group Management**: Features include anti-link, anti-image, anti-spam, and custom welcome/leave messages.
- **Developer-Friendly**: Clean code structure with comprehensive examples and hot-reloading for easy development.
- **Cross-Platform**: Compatible with VPS and Termux environments.

### Artificial Intelligence Model Support
- **Groq**: Default AI provider, fast and efficient for general chat and AutoAI.
- **Google Gemini**: Advanced reasoning and contextual understanding.
- **Cerebras**: High-performance inference for large-scale responses.

### Installation and Setup

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

### Configuration

All bot configuration is handled in the `config.js` file. On the first run, you will be prompted to enter your Bot Token and Owner ID. For advanced features, you will need to add the respective API keys.

```javascript
module.exports = {
  token: 'YOUR_TOKEN_TELE',
  ownerId: ['YOUR_ID_TELE'],
  groqKeys: ["YOUR_APIKEY_GROQ"],
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
  cerebrasKeys: ["YOUR_CEREBRAS_API_KEY"],
  // ... other settings
};
```

### Code Patterns and Usage

### AutoAI Management
The AutoAI feature can be configured per-chat to use different AI providers.

- **Command**: `.autoai [--provider] <on|off>`
- **Providers**: `--groq`, `--gemini`, `--cerebras`.
- **Default**: If no provider flag is used, the command defaults to `groq`.
- **Example**: To enable AutoAI with the Gemini provider, use `.autoai --gemini on`.
- **History**: The AI chat history for a specific chat is automatically cleared when the provider is changed to ensure context relevancy.

### Group Management
Group settings are managed via the `/setting` command, which provides an interactive button menu for admins.

- **/setting**: Shows the main settings menu.
- **/setting setwelcome &lt;message&gt;**: Sets a custom welcome message. Use `{user}` for the user's mention and `{group}` for the group's name.
- **/setting setleave &lt;message&gt;**: Sets a custom leave message. Use `{user}` for the user's mention and `{group}` for the group name.
- **/kick**: To remove members.

### Owner-Only Commands
Restrict commands to the bot owner using a simple validation check against `config.js`.
```javascript
// plugins/eval.js
const { isOwner } = require('../lib/owner.js');

module.exports = {
  name: 'eval',
  category: 'owner',
  async execute(bot, msg, args) {
    // Validate owner identity
    if (!isOwner(msg.from.id)) {
      return bot.sendMessage(msg.chat.id, 'This command is restricted to the bot owner.');
    }
    // ... command logic
  }
};
```
### Scrape Command
Scrape commands are simple wrappers that call an existing scraper function from the bot system.  
They do not contain scraping logic.
```javascript
module.exports = {
  name: 'tiktokmp3',
  aliases: ['ttmp3'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id
    const url = args[0]

    if (!url) {
      return bot.sendMessage(chatId, 'Example: /tiktokmp3 <url>')
    }

    // Call scraper function
    const audio = await bot.tiktokmp3(url)

    if (!audio) {
      return bot.sendMessage(chatId, 'Failed to retrieve audio.')
    }

    bot.sendMessage(chatId, audio)
  }
}
```
# Support

For technical support and development questions, contact the developer:
- **Telegram**: [HAZELOFFC](t.me/hazeloffc)
- **GitHub**: [hazelnuttty](https://github.com/hazelnuttty)
- **LIONA-MD**: [LIONA-MD](t.me/liona_mdbot)
- **LIONA-MD GRUB**: [GRUB TELE](https://t.me/lionamd)

---
*Liona-MD is maintained as an open-source project. Contributions and feedback are welcome to improve the framework's capabilities and documentation.*
