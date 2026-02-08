const fs = require('fs');
const origWriteFileSync = fs.writeFileSync;
const origWriteFile = fs.writeFile;
const origPromisesWriteFile = fs.promises?.writeFile;

function logIfBad(data, label) {
  if (typeof data === 'undefined') {
    const err = new Error(`writeFile called with undefined data (${label})`);
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }
}

fs.writeFileSync = function patchedWriteFileSync(path, data, ...rest) {
  logIfBad(data, `sync:${path}`);
  return origWriteFileSync.call(this, path, data, ...rest);
};

fs.writeFile = function patchedWriteFile(path, data, ...rest) {
  logIfBad(data, `async:${path}`);
  return origWriteFile.call(this, path, data, ...rest);
};

if (origPromisesWriteFile) {
  fs.promises.writeFile = function patchedPromisesWriteFile(path, data, ...rest) {
    logIfBad(data, `promises:${path}`);
    return origPromisesWriteFile.call(this, path, data, ...rest);
  };
}

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('[trace] uncaughtException stack:', err && err.stack ? err.stack : err);
});

try {
  const crypto = require('crypto');
  const origHashUpdate = crypto.Hash.prototype.update;
  crypto.Hash.prototype.update = function patchedHashUpdate(data, ...rest) {
    if (typeof data === 'undefined') {
      const err = new Error('crypto.Hash.update called with undefined data');
      // eslint-disable-next-line no-console
      console.error(err.stack);
    }
    return origHashUpdate.call(this, data, ...rest);
  };
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('[trace] failed to patch crypto.Hash.update', error);
}
