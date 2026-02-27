'use strict';

const fs = require('node:fs');
const path = require('node:path');

const FALLBACK_CODES = new Set(['EPERM', 'ENOSYS', 'ENOENT', 'UNKNOWN', 'EEXIST']);

function toAbsoluteTarget(target, destination) {
  const targetPath = String(target || '');
  const destinationPath = String(destination || '');
  if (!targetPath || !destinationPath) return null;
  if (path.isAbsolute(targetPath)) return targetPath;
  return path.resolve(path.dirname(destinationPath), targetPath);
}

async function copyResolvedTarget(resolvedTarget, destination) {
  const destinationPath = String(destination || '');
  await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.promises.rm(destinationPath, { recursive: true, force: true });

  const sourceStats = await fs.promises.lstat(resolvedTarget);
  if (sourceStats.isSymbolicLink()) {
    const real = await fs.promises.realpath(resolvedTarget);
    return copyResolvedTarget(real, destinationPath);
  }

  if (sourceStats.isDirectory()) {
    await fs.promises.cp(resolvedTarget, destinationPath, {
      recursive: true,
      force: true,
      dereference: true,
    });
    return;
  }

  await fs.promises.copyFile(resolvedTarget, destinationPath);
}

async function trySymlinkFallback(error, target, destination) {
  if (!error || !FALLBACK_CODES.has(String(error.code || ''))) {
    throw error;
  }
  if (String(error.code || '') === 'EEXIST') {
    return;
  }

  const resolvedTarget = toAbsoluteTarget(target, destination);
  if (!resolvedTarget || !fs.existsSync(resolvedTarget)) {
    throw error;
  }
  await copyResolvedTarget(resolvedTarget, destination);
}

const originalSymlink = fs.symlink.bind(fs);
fs.symlink = function patchedSymlink(target, destination, type, callback) {
  let symlinkType = type;
  let cb = callback;
  if (typeof symlinkType === 'function') {
    cb = symlinkType;
    symlinkType = undefined;
  }

  if (typeof cb !== 'function') {
    return originalSymlink(target, destination, symlinkType);
  }

  return originalSymlink(target, destination, symlinkType, (error) => {
    if (!error) {
      cb(null);
      return;
    }

    trySymlinkFallback(error, target, destination)
      .then(() => cb(null))
      .catch(() => cb(error));
  });
};

const originalPromisesSymlink = fs.promises.symlink.bind(fs.promises);
fs.promises.symlink = async function patchedPromisesSymlink(target, destination, type) {
  try {
    await originalPromisesSymlink(target, destination, type);
  } catch (error) {
    await trySymlinkFallback(error, target, destination);
  }
};
