import fs from 'node:fs/promises';
import path from 'node:path';

export function normalizeLineBreaks(input) {
  return String(input || '').replace(/\r\n/g, '\n');
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseEnv(raw) {
  const values = {};
  const lines = normalizeLineBreaks(raw).split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) continue;
    values[match[1]] = unquote(match[2] ?? '');
  }
  return values;
}

export async function readEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return {
      path: filePath,
      exists: true,
      raw,
      values: parseEnv(raw),
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {
        path: filePath,
        exists: false,
        raw: '',
        values: {},
      };
    }
    throw error;
  }
}

export async function readJson(filePath, fallback = null) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

export async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function writeTextFile(filePath, content) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, normalizeLineBreaks(content), 'utf8');
}

export async function writeJson(filePath, value) {
  await writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function isValueSet(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function backupFileIfExists(filePath) {
  const existing = await readEnvFile(filePath);
  if (!existing.exists) return null;

  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const backupPath = `${filePath}.bak.${stamp}`;
  await ensureDir(backupPath);
  await fs.writeFile(backupPath, existing.raw, 'utf8');
  return backupPath;
}

export function pickUnknownKeys(source, knownKeys) {
  const known = new Set(knownKeys || []);
  const extras = {};
  for (const [key, value] of Object.entries(source || {})) {
    if (!known.has(key)) {
      extras[key] = value;
    }
  }
  return extras;
}

export function buildEnvContent(headerLines, orderedKeys, values, commentsByKey = {}) {
  const lines = [];

  for (const line of headerLines || []) {
    lines.push(line);
  }
  if (lines.length > 0) {
    lines.push('');
  }

  for (const key of orderedKeys || []) {
    if (!(key in values)) continue;
    const comment = commentsByKey[key];
    if (comment) {
      lines.push(`# ${comment}`);
    }
    lines.push(`${key}=${values[key] ?? ''}`);
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

