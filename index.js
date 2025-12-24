const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const mainPath = path.join(__dirname, 'src', 'main.js');

function animateText(tag, message, delay = 40, cb) {
    let i = 0;
    process.stdout.write(chalk.cyan(`[ ${tag} ] `));
    const interval = setInterval(() => {
        if (i < message.length) {
            process.stdout.write(message[i]);
            i++;
        } else {
            clearInterval(interval);
            console.log();
            if (cb) cb();
        }
    }, delay);
}

console.clear();

animateText('START', 'STARTING THE MAIN SYSTEM...', 45, () => {
    setTimeout(() => {
        if (!fs.existsSync(mainPath)) {
            animateText('ERROR', 'src/main.js NOT FOUND!', 40, () => process.exit(1));
            return;
        }

        animateText('WELCOME', 'BOT HAS BEEN LOGIN!', 45, () => {
            animateText('STATUS', 'SYSTEM READY • ALL MODULE LOADED', 35, () => {
                require(mainPath);
            });
        });
    }, 400);
});