const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const chalk = require('chalk');

const log = {
    info: (msg) => console.log(chalk.cyan(`[AutoUpdate] ${msg}`)),
    success: (msg) => console.log(chalk.green(`[AutoUpdate] ${msg}`)),
    warn: (msg) => console.log(chalk.yellow(`[AutoUpdate] ${msg}`)),
    error: (err, context) => console.error(chalk.red(`[AutoUpdate] ${context ? `[${context}]` : ''} - ${err.stack || err.message || err}`)),
};

const GITHUB_REPO_API = 'https://api.github.com/repos/hazelnuttty/LIONA-MD';
const GITHUB_REPO_RAW = 'https://raw.githubusercontent.com/hazelnuttty/LIONA-MD/main';
const ROOT_DIR = path.join(__dirname, '..');

async function getRemoteData(url) {
    try {
        const { data } = await axios.get(url, { timeout: 10000 });
        return data;
    } catch (error) {
        log.error(error, `Failed to fetch from ${url}`);
        return null;
    }
}

function compareVersions(local, remote) {
    if (!local || !remote) return false;
    const localParts = local.split('.').map(Number);
    const remoteParts = remote.split('.').map(Number);
    for (let i = 0; i < Math.max(localParts.length, remoteParts.length); i++) {
        const localPart = localParts[i] || 0;
        const remotePart = remoteParts[i] || 0;
        if (remotePart > localPart) return true;
        if (remotePart < localPart) return false;
    }
    return false;
}

function restartProcess() {
    const child = spawn(process.argv[0], process.argv.slice(1), {
        cwd: process.cwd(),
        detached: true,
        stdio: 'inherit'
    });
    child.unref();
    process.exit();
}

async function checkForUpdates() {
    const localConfigPath = path.join(ROOT_DIR, 'config.js');
    const localPackagePath = path.join(ROOT_DIR, 'package.json');
    if (!fs.existsSync(localConfigPath) || !fs.existsSync(localPackagePath)) return false;

    const localConfig = require(localConfigPath);
    const localPackage = require(localPackagePath);

    const remotePackageRaw = await getRemoteData(`${GITHUB_REPO_RAW}/package.json`);
    if (!remotePackageRaw) return false;

    let remotePackage;
    if (typeof remotePackageRaw === 'string') {
        try { remotePackage = JSON.parse(remotePackageRaw); } catch { return false; }
    } else remotePackage = remotePackageRaw;

    const localVersion = localConfig.botVersion;
    const remoteVersion = remotePackage.version;
    if (!compareVersions(localVersion, remoteVersion)) return false;

    const treeData = await getRemoteData(`${GITHUB_REPO_API}/git/trees/main?recursive=1`);
    if (!treeData || !treeData.tree) return false;

    const remoteFiles = treeData.tree.filter(node => node.type === 'blob').map(node => node.path);
    const ignoredPaths = ['node_modules', '.git', 'sessions', 'database/config.json', '.npm', '.cache', 'temp'];

    for (const filePath of remoteFiles) {
        if (ignoredPaths.some(p => filePath.startsWith(p))) continue;
        const localPath = path.join(ROOT_DIR, filePath);
        const fileContent = await getRemoteData(`${GITHUB_REPO_RAW}/${filePath}`);
        if (fileContent === null) continue;

        if (filePath === 'config.js') {
            const remoteConfigContent = typeof fileContent === 'object' ? JSON.stringify(fileContent, null, 2) : fileContent;
            const newConfig = remoteConfigContent
                .replace(/(token: *)'.*'/, `$1'${localConfig.token}'`)
                .replace(/(ownerId: *)[\[.*\]]/, `$1${JSON.stringify(localConfig.ownerId)}`)
                .replace(/(groqKeys: *)\[.*\]/, `$1${JSON.stringify(localConfig.groqKeys || [])}`);
            fs.writeFileSync(localPath, newConfig, 'utf-8');
            continue;
        }

        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const contentToWrite = typeof fileContent === 'object' ? JSON.stringify(fileContent, null, 2) : fileContent;
        fs.writeFileSync(localPath, contentToWrite, 'utf-8');
    }

    const getLocalFiles = (dir) => {
        let files = [];
        try {
            for (const item of fs.readdirSync(dir)) {
                const fullPath = path.join(dir, item);
                const relativePath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/'); 
                if (ignoredPaths.some(p => relativePath.startsWith(p))) continue;
                if (fs.statSync(fullPath).isDirectory()) files = files.concat(getLocalFiles(fullPath));
                else files.push(relativePath);
            }
        } catch {}
        return files;
    };

    const localFiles = getLocalFiles(ROOT_DIR);
    for (const localFile of localFiles) {
        if (!remoteFiles.includes(localFile) && localFile !== 'lib/_AutoUpdate.js') {
            try { fs.unlinkSync(path.join(ROOT_DIR, localFile)); } catch {}
        }
    }

    if (JSON.stringify(remotePackage.dependencies) !== JSON.stringify(localPackage.dependencies)) {
        exec('npm install', (error) => { 
            if (!error) restartProcess(); 
            else process.exit(1); 
        });
    } else restartProcess();

    return true;
}

module.exports = { checkForUpdates };