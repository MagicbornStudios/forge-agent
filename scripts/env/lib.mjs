import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { APP_ALIASES, APP_CONFIG, ENV_MANIFEST } from './manifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const repoRoot = path.resolve(__dirname, '..', '..');

/**
 * @param {string} relativePath
 */
export function resolveRepoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

/**
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    if (!key) continue;

    const maybeValue = argv[i + 1];
    if (maybeValue != null && !maybeValue.startsWith('--')) {
      options[key] = maybeValue;
      i += 1;
      continue;
    }

    options[key] = true;
  }

  return options;
}

/**
 * @param {string | undefined} appOption
 */
export function getSelectedApps(appOption) {
  const normalized = (appOption ?? 'all').toLowerCase().trim();
  if (normalized === 'all') {
    return /** @type {Array<'studio'|'platform'>} */ (Object.keys(APP_CONFIG));
  }

  const aliased = APP_ALIASES[normalized] ?? normalized;
  if (!(aliased in APP_CONFIG)) {
    throw new Error(`Unknown app "${appOption}". Expected studio, platform, or all.`);
  }
  return [/** @type {'studio'|'platform'} */ (aliased)];
}

/**
 * @param {'studio'|'platform'} app
 */
export function getAppConfig(app) {
  return APP_CONFIG[app];
}

/**
 * @param {'studio'|'platform'} app
 */
export function getManifestEntries(app) {
  return ENV_MANIFEST.filter((entry) => entry.app === app);
}

/**
 * @param {string} value
 */
function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * @param {string} raw
 */
export function parseEnv(raw) {
  /** @type {Record<string, string>} */
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) continue;
    const key = match[1];
    const value = unquote(match[2] ?? '');
    values[key] = value;
  }
  return values;
}

/**
 * @param {string} filePath
 */
export async function readEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return {
      exists: true,
      raw,
      values: parseEnv(raw),
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {
        exists: false,
        raw: '',
        values: {},
      };
    }
    throw error;
  }
}

/**
 * @param {string[]} headerLines
 * @param {Record<string, string>} values
 * @param {string[]} orderedKeys
 * @param {Record<string, string>} [extras]
 */
export function buildEnvFile(headerLines, values, orderedKeys, extras = {}) {
  const output = [];

  for (const headerLine of headerLines) {
    output.push(headerLine);
  }
  if (headerLines.length > 0) {
    output.push('');
  }

  for (const key of orderedKeys) {
    if (!(key in values)) continue;
    const value = values[key] ?? '';
    output.push(`${key}=${value}`);
  }

  const extraKeys = Object.keys(extras).sort();
  if (extraKeys.length > 0) {
    output.push('', '# Preserved custom keys');
    for (const key of extraKeys) {
      output.push(`${key}=${extras[key] ?? ''}`);
    }
  }

  return `${output.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

/**
 * @param {string} value
 */
export function isValueSet(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {{key: string, equals?: string, notEquals?: string, truthy?: boolean} | undefined} condition
 * @param {Record<string, string>} values
 */
export function isConditionSatisfied(condition, values) {
  if (!condition) return true;
  const raw = values[condition.key];
  if (condition.equals != null) {
    return raw === condition.equals;
  }
  if (condition.notEquals != null) {
    return raw !== condition.notEquals;
  }
  if (condition.truthy === true) {
    return isValueSet(raw);
  }
  return true;
}

/**
 * @param {{requiredIn?: Array<'local'|'preview'|'production'>, dependsOn?: {key: string, equals?: string, notEquals?: string, truthy?: boolean}}} entry
 * @param {'local'|'preview'|'production'} mode
 * @param {Record<string, string>} values
 */
export function isEntryRequiredForMode(entry, mode, values) {
  if (!entry.requiredIn || !entry.requiredIn.includes(mode)) {
    return false;
  }
  return isConditionSatisfied(entry.dependsOn, values);
}

/**
 * @param {unknown} value
 */
export function asString(value) {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
}

/**
 * @param {string} value
 * @param {boolean} secret
 */
export function maskValue(value, secret) {
  if (!isValueSet(value)) return '<missing>';
  if (!secret) return '<set>';
  return '<set:masked>';
}

/**
 * @param {string} input
 */
export function normalizeLineBreaks(input) {
  return input.replace(/\r\n/g, '\n');
}

/**
 * @param {string} filePath
 */
export async function ensureParentDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

/**
 * @param {string} filePath
 * @param {string} content
 */
export async function writeTextFile(filePath, content) {
  await ensureParentDir(filePath);
  await fs.writeFile(filePath, normalizeLineBreaks(content), 'utf8');
}

/**
 * @param {Record<string, string>} source
 * @param {string[]} knownKeys
 */
export function pickUnknownKeys(source, knownKeys) {
  const known = new Set(knownKeys);
  /** @type {Record<string, string>} */
  const extras = {};
  for (const [key, value] of Object.entries(source)) {
    if (!known.has(key)) {
      extras[key] = value;
    }
  }
  return extras;
}

