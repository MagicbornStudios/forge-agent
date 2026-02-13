import fs from 'node:fs';
import path from 'node:path';

export function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function ensureParentDir(filePath) {
  ensureDir(path.dirname(filePath));
}

export function readText(filePath, fallback = '') {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return fallback;
  }
}

export function writeText(filePath, content) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(filePath, data) {
  writeText(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export function listFiles(dirPath, predicate = null) {
  if (!fileExists(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .map((name) => path.join(dirPath, name))
    .filter((fullPath) => {
      if (!predicate) return true;
      return predicate(fullPath);
    });
}

export function listFilesRecursive(dirPath, extensions = null) {
  if (!fileExists(dirPath)) return [];

  const result = [];
  const stack = [dirPath];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
        continue;
      }

      if (!extensions || extensions.some((ext) => entry.name.endsWith(ext))) {
        result.push(entryPath);
      }
    }
  }

  return result.sort();
}

export function replaceFileSection(filePath, replaceFn) {
  const current = readText(filePath, '');
  const updated = replaceFn(current);
  if (updated !== current) {
    writeText(filePath, updated);
    return true;
  }
  return false;
}

export function relativeFrom(rootPath, fullPath) {
  return path.relative(rootPath, fullPath).replace(/\\/g, '/');
}
