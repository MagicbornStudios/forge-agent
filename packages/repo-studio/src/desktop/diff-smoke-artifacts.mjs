import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args.set(key, next);
      index += 1;
      continue;
    }
    args.set(key, true);
  }

  return {
    a: String(args.get('a') || '').trim(),
    b: String(args.get('b') || '').trim(),
    includeVolatile: args.get('include-volatile') === true,
    failOnDiff: args.get('fail-on-diff') === true,
    maxRows: Number(args.get('max-rows') || 120),
  };
}

function flattenPrimitives(input, prefix = '', out = new Map()) {
  if (input == null) {
    out.set(prefix || '(root)', input);
    return out;
  }

  const valueType = typeof input;
  if (valueType !== 'object') {
    out.set(prefix || '(root)', input);
    return out;
  }

  if (Array.isArray(input)) {
    if (input.length === 0) {
      out.set(prefix || '(root)', []);
      return out;
    }
    input.forEach((item, index) => {
      const next = prefix ? `${prefix}[${index}]` : `[${index}]`;
      flattenPrimitives(item, next, out);
    });
    return out;
  }

  const entries = Object.entries(input);
  if (entries.length === 0) {
    out.set(prefix || '(root)', {});
    return out;
  }
  for (const [key, value] of entries) {
    const next = prefix ? `${prefix}.${key}` : key;
    flattenPrimitives(value, next, out);
  }
  return out;
}

function pathIsVolatile(pathKey = '') {
  const volatilePatterns = [
    /\.pid$/i,
    /\.pids(\.|$)/i,
    /\.elapsedMs$/i,
    /\.failureArtifactPath$/i,
    /\.artifactPath$/i,
    /\.processId$/i,
    /\.startedAt$/i,
    /\.mtimeMs$/i,
  ];
  return volatilePatterns.some((pattern) => pattern.test(pathKey));
}

function readJson(filePath) {
  if (!filePath) {
    throw new Error('Missing --a/--b path.');
  }
  const absolute = path.resolve(filePath);
  const raw = fs.readFileSync(absolute, 'utf8');
  return {
    absolute,
    json: JSON.parse(raw),
  };
}

function valueToString(value) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function diffSmokeArtifacts(options = {}) {
  const left = readJson(options.a);
  const right = readJson(options.b);
  const includeVolatile = options.includeVolatile === true;
  const maxRows = Number(options.maxRows || 120);

  const leftFlat = flattenPrimitives(left.json);
  const rightFlat = flattenPrimitives(right.json);
  const allKeys = [...new Set([...leftFlat.keys(), ...rightFlat.keys()])]
    .sort((a, b) => a.localeCompare(b));

  const diffs = [];
  for (const key of allKeys) {
    if (!includeVolatile && pathIsVolatile(key)) continue;
    const leftValue = leftFlat.get(key);
    const rightValue = rightFlat.get(key);
    const leftString = valueToString(leftValue);
    const rightString = valueToString(rightValue);
    if (leftString === rightString) continue;
    diffs.push({
      key,
      left: leftString,
      right: rightString,
    });
  }

  const header = [
    '## RepoStudio Smoke Artifact Diff',
    '',
    `A: \`${left.absolute}\``,
    `B: \`${right.absolute}\``,
    `Differences: **${diffs.length}**`,
    '',
  ];

  const rows = [];
  if (diffs.length > 0) {
    rows.push('| Path | A | B |');
    rows.push('|---|---|---|');
    for (const diff of diffs.slice(0, maxRows)) {
      const pathCell = diff.key.replace(/\|/g, '\\|');
      const leftCell = diff.left.replace(/\|/g, '\\|');
      const rightCell = diff.right.replace(/\|/g, '\\|');
      rows.push(`| \`${pathCell}\` | \`${leftCell}\` | \`${rightCell}\` |`);
    }
    if (diffs.length > maxRows) {
      rows.push('');
      rows.push(`(truncated: showing first ${maxRows} differences)`);
    }
  } else {
    rows.push('No differences (after volatile-field filtering).');
  }

  const markdown = `${[...header, ...rows].join('\n')}\n`;
  return {
    ok: true,
    left: left.absolute,
    right: right.absolute,
    differences: diffs.length,
    includeVolatile,
    maxRows,
    markdown,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const cliArgs = parseArgs();
    const result = diffSmokeArtifacts(cliArgs);
    // eslint-disable-next-line no-console
    console.log(result.markdown);
    process.exitCode = result.differences > 0 && cliArgs.failOnDiff ? 1 : 0;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`desktop smoke artifact diff failed: ${error instanceof Error ? error.message : String(error || 'unknown error')}`);
    process.exitCode = 1;
  }
}
