const chokidar = require('chokidar');
const path = require('path');
const print = require('./print.js');

module.exports = (dirs = [], onReload) => {
  const watcher = chokidar.watch(dirs, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('change', filePath => {
    if (!filePath.endsWith('.js')) return;

    const fileName = path.basename(filePath);

    try {
      delete require.cache[require.resolve(filePath)];
      print.info(`♻️ File reloaded from cache: ${fileName}`);
      
      if (typeof onReload === 'function') {
        onReload(filePath);
      }
    } catch (err) {
      print.error(err, 'Hot Reload');
    }
  });

  watcher.on('error', err => {
    print.error(err, 'Watcher');
  });
};
