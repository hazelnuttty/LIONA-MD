const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const mainPath = path.join(__dirname, 'src', 'main.js');
const autoUpdatePath = path.join(__dirname, 'lib', '_AutoUpdate.js');

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

async function start() {
    if (fs.existsSync(autoUpdatePath)) {
        const { checkForUpdates } = require(autoUpdatePath);
        try {
            const isUpdating = await checkForUpdates();
            if (isUpdating) {
                return;
            }
        } catch (e) {
            console.log(chalk.red('[ERROR] Auto-update check failed. Starting bot normally...'), e);
        }
    }

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
}

console.clear();
start();