[![Hazelnuts](./media/image.jpg)](https://zelapioffciall.koyeb.app)
<p align="center">
  <img src="https://img.shields.io/badge/-Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="2">
  <img src="https://img.shields.io/badge/Telegram-26A5E4?style=flat&logo=telegram&logoColor=white" alt="0">
  <img src="https://img.shields.io/badge/npm_Package-CB3837?style=flat&logo=npm&logoColor=white" alt="2">
  <img src="https://img.shields.io/badge/Node-Telegram_API-339933?style=flat&logo=nodedotjs&logoColor=white" alt="5">
</p>

# Overview

Liona-MD is a modular Telegram bot framework built with Node.js, designed for simplicity and extensibility. It features a CommonJS plugin architecture that makes it accessible for beginner developers while providing powerful scraping capabilities and API integration for advanced users. The framework emphasizes clean code organization and developer-friendly patterns.

# Features

· Plugin-Based Architecture: Easily extendable through CJS modules

· Built-in Scraping Functions: Pre-configured web scraping utilities

· API Integration: Seamless connection to external services

· Developer-Friendly: Clear code structure with comprehensive examples

· Cross-Platform: Compatible with VPS and Termux environments

# Installation and Setup

**VPS Deployment**

```bash
# Update system and install dependencies
sudo apt update
sudo apt upgrade
sudo apt install git -y

# Clone repository and setup
git clone https://github.com/hazenuttty/liona-md
cd liona-md
mv liona-md/* liona-md/.[!.]* liona-md/..?* /root/

# Install dependencies and configure
npm install
# Configure token and owner ID in config.js before starting
npm start
```

**Termux Deployment (Android)**

```bash
# Update packages and install requirements
pkg update && pkg upgrade
pkg install git nodejs -y

# Clone and setup
git clone https://github.com/hazenuttty/LIONA-MD
cd LIONA-MD
npm install

# Configure and launch
# Edit config.js to set your token and owner ID
npm start
```

# Framework Architecture

**Core Structure**

```
├── config.js              # Configuration file (bot token, API endpoints)
├── index.js              # Application entry point
├── lib/                  # Core libraries
│   ├── handler.js       # Command and event handler
│   ├── print.js         # Enhanced logging utilities
│   ├── database.js      # Database abstraction layer
│   ├── cache.js         # Caching mechanisms
│   ├── autoReload.js    # Plugin hot-reload functionality
│   └── login.js         # Authentication management
├── plugins/              # Command plugins directory
├── scrape/              # Web scraping modules
├── function/            # Utility functions
│   ├── _group.js       # Group management utilities
│   └── helper.js       # General helper functions
├── database/            # Database configuration
└── src/main.js         # Main bot logic
```

# Code Patterns and Usage

**Scraper Function Integration**

Liona-MD includes built-in scraping functions accessible through the bot instance:

```javascript
module.exports = {
  name: 'skoleai',
  aliases: ['ai'],
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const question = args.join(' ');
    if (!question) return bot.sendMessage(chatId, 'Please provide a question');
    
    // Access scraper function via bot instance
    const response = await bot.skoleAI(question);
    bot.sendMessage(chatId, response);
  }
}
```

# API Provider Integration

External API calls utilize the centralized configuration:

```javascript
const axios = require('axios');
const print = require('../lib/print.js');
const config = require('../config.js');

module.exports = {
  name: 'certificate',
  aliases: [],
  category: 'canvas',
  description: 'Generate certificate image',
  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    
    try {
      const text = args.join(' ') || 'default text';
      const url = `${config.apiProvider}/canvas/certificate?text=${encodeURIComponent(text)}`;
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });
      
      await bot.sendPhoto(
        chatId,
        Buffer.from(response.data),
        { caption: 'Certificate generated' }
      );
      
    } catch (error) {
      print.error(error, 'Certificate Command');
      await bot.sendMessage(chatId, 'Error generating certificate');
    }
  }
}
```

# Owner-Only Commands

Restrict commands to the bot owner using configuration-based validation:

```javascript
const config = require('../config.js');

module.exports = {
  name: 'eval',
  aliases: ['ev'],
  category: 'owner',
  async execute(bot, msg, args) {
    // Validate owner identity
    if (msg.from.id !== config.ownerId) {
      return bot.sendMessage(msg.chat.id, 'This command is restricted to the bot owner.');
    }
    
    if (!args.length) {
      return bot.sendMessage(msg.chat.id, 'Please provide code to evaluate.');
    }
    
    try {
      const code = args.join(' ');
      let result = eval(code);
      
      // Handle async operations
      if (result && typeof result.then === 'function') {
        result = await result;
      }
      
      // Format output based on type
      let output = result;
      if (typeof result === 'object') {
        output = JSON.stringify(result, null, 2);
      }
      
      return bot.sendMessage(
        msg.chat.id,
        `Result:\n\`\`\`javascript\n${output}\n\`\`\``,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      return bot.sendMessage(
        msg.chat.id,
        `Error:\n\`\`\`javascript\n${error}\n\`\`\``,
        { parse_mode: 'Markdown' }
      );
    }
  }
};
```

# Utility Functions

· print.error("message"): Enhanced error logging with contextual information

· bot.skoleAI: Access scraping functions directly from bot instance

· ${config.apiProvider}/endpoint: Centralized API endpoint configuration

# Plugin Development

**Plugin Structure**
Each plugin in the plugins/ directory should export an object with the following properties:

```javascript
module.exports = {
  name: 'commandname',      // Primary command trigger
  aliases: ['alias1', 'alias2'], // Alternative triggers
  category: 'utility',      // Command category for organization
  description: 'Brief description', // Help text
  async execute(bot, msg, args) {
    // Command implementation
  }
}
```

# Available Modules.
The framework provides several utility modules:

· Scraping (scrape/): Web scraping utilities for various services

· Functions (function/): Reusable helper functions and group management

· Libraries (lib/): Core framework functionality

· Plugins (plugins/): User-extensible command modules

# Configuration

Edit config.js to set up your bot:

```javascript
module.exports = {
  botToken: 'YOUR_TELEGRAM_BOT_TOKEN',
  ownerId: 'YOUR_TELEGRAM_USER_ID',
  apiProvider: 'https://your-api-provider.com',
  // Additional configuration options
};
```

# Best Practices

1. Error Handling: Always wrap API calls in try-catch blocks

2. Input Validation: Validate user input before processing

3. Resource Management: Properly handle file streams and network connections

4. Code Organization: Place related functionality in appropriate directories

5. Documentation: Comment complex logic for maintainability

# Troubleshooting

· Ensure Node.js version 14 or higher is installed

· Verify bot token and API endpoints in config.js

· Check network connectivity for API calls

· Review console logs using print.error() for debugging

# Support

**For technical support and development questions, contact the developer:**
Telegram: @hazeloffc

---

Liona-MD is maintained as an open-source project. Contributions and feedback are welcome to improve the framework's capabilities and documentation.