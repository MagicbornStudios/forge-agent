import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
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

  const summaryFile = String(args.get('summary-file') || process.env.GITHUB_STEP_SUMMARY || '').trim();
  return {
    dir: String(args.get('dir') || process.env.RUNNER_TEMP || os.tmpdir()).trim(),
    summaryFile,
    writeSummary: args.get('write-summary') === true,
  };
}

function toBoolEmoji(value) {
  if (value === true) return '✅';
  if (value === false) return '❌';
  return '—';
}

function getPath(input, pathParts = []) {
  let current = input;
  for (const part of pathParts) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

function oneLine(value, fallback = '—') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

async function pickLatestReport(dirPath, prefix) {
  let entries = [];
  try {
    entries = await fsp.readdir(dirPath, { withFileTypes: true });
  } catch {
    return null;
  }

  let latest = null;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.startsWith(prefix) || !entry.name.endsWith('.json')) continue;
    const fullPath = path.join(dirPath, entry.name);
    let stat = null;
    try {
      // eslint-disable-next-line no-await-in-loop
      stat = await fsp.stat(fullPath);
    } catch {
      continue;
    }
    const candidate = {
      path: fullPath,
      name: entry.name,
      mtimeMs: stat.mtimeMs,
    };
    if (!latest || candidate.mtimeMs > latest.mtimeMs) {
      latest = candidate;
    }
  }

  if (!latest) return null;
  try {
    const raw = await fsp.readFile(latest.path, 'utf8');
    latest.json = JSON.parse(raw);
    return latest;
  } catch {
    return null;
  }
}

function summarizeSmoke(report) {
  if (!report?.json) return 'no report';
  const data = report.json;
  const launchHealth = getPath(data, ['launch', 'health', 'ok']);
  const launchStatus = getPath(data, ['launch', 'health', 'status']);
  const launchElapsed = getPath(data, ['launch', 'health', 'elapsedMs']);
  const warnings = Array.isArray(data.warnings) ? data.warnings.length : 0;
  const installReady = data.installReady === true;
  const installCompleted = data.installCompleted === true;
  const effectiveDir = oneLine(data.effectiveInstallDir, 'n/a');

  return [
    `ok=${toBoolEmoji(data.ok)}`,
    `install=${toBoolEmoji(installCompleted)}`,
    `ready=${toBoolEmoji(installReady)}`,
    `health=${toBoolEmoji(launchHealth)}${launchStatus != null ? ` (${launchStatus})` : ''}`,
    launchElapsed != null ? `healthMs=${launchElapsed}` : null,
    `warnings=${warnings}`,
    `dir=${effectiveDir}`,
  ].filter(Boolean).join(' | ');
}

function summarizeRuntime(report) {
  if (!report?.json) return 'no report';
  const data = report.json;
  const healthOk = getPath(data, ['checks', 'health', 'ok']);
  const runtimeDepsOk = getPath(data, ['checks', 'runtimeDeps', 'ok']);
  const codexOk = getPath(data, ['checks', 'codexStatus', 'ok']);
  const warnings = Array.isArray(data.warnings) ? data.warnings.length : 0;
  const message = oneLine(data.message, 'n/a');

  return [
    `ok=${toBoolEmoji(data.ok)}`,
    `health=${toBoolEmoji(healthOk)}`,
    `deps=${toBoolEmoji(runtimeDepsOk)}`,
    `codexCli=${toBoolEmoji(codexOk)}`,
    `warnings=${warnings}`,
    `message=${message}`,
  ].join(' | ');
}

function summarizeRepair(report) {
  if (!report?.json) return 'no report';
  const data = report.json;
  const failedRemovals = Array.isArray(data.removals)
    ? data.removals.filter((entry) => entry.ok === false).length
    : 0;
  const failedStops = Array.isArray(data.processStop)
    ? data.processStop.reduce((sum, entry) => sum + (Array.isArray(entry.failedPids) ? entry.failedPids.length : 0), 0)
    : 0;
  const timedOut = data.uninstallResult?.timedOut === true;

  return [
    `ok=${toBoolEmoji(data.ok)}`,
    `failedRemovals=${failedRemovals}`,
    `failedStops=${failedStops}`,
    `uninstallTimedOut=${toBoolEmoji(timedOut)}`,
  ].join(' | ');
}

function summarizeUpgradeRepair(report) {
  if (!report?.json) return 'no report';
  const data = report.json;
  const breakOk = data.breakResult?.ok === true;
  const repairedOk = data.repaired?.ok === true;
  const message = oneLine(data.message, 'n/a');
  return [
    `ok=${toBoolEmoji(data.ok)}`,
    `break=${toBoolEmoji(breakOk)}`,
    `repair=${toBoolEmoji(repairedOk)}`,
    `message=${message}`,
  ].join(' | ');
}

function buildSummaryMarkdown(context) {
  const lines = [
    '## RepoStudio Desktop Smoke Summary',
    '',
    `Runner temp: \`${context.dir}\``,
    '',
    '| Report | File | Summary |',
    '|---|---|---|',
    `| Installer smoke | ${context.smoke?.name ? `\`${context.smoke.name}\`` : 'none'} | ${summarizeSmoke(context.smoke)} |`,
    `| Runtime probe | ${context.runtime?.name ? `\`${context.runtime.name}\`` : 'none'} | ${summarizeRuntime(context.runtime)} |`,
    `| Repair | ${context.repair?.name ? `\`${context.repair.name}\`` : 'none'} | ${summarizeRepair(context.repair)} |`,
    `| Upgrade-repair | ${context.upgradeRepair?.name ? `\`${context.upgradeRepair.name}\`` : 'none'} | ${summarizeUpgradeRepair(context.upgradeRepair)} |`,
    '',
  ];
  return `${lines.join('\n')}\n`;
}

export async function summarizeSmokeReports(options = {}) {
  const dir = String(options.dir || '').trim();
  const summaryFile = String(options.summaryFile || '').trim();
  const writeSummary = options.writeSummary === true;

  const [smoke, runtime, repair, upgradeRepair] = await Promise.all([
    pickLatestReport(dir, 'repostudio-smoke-result'),
    pickLatestReport(dir, 'repostudio-runtime-probe'),
    pickLatestReport(dir, 'repostudio-repair'),
    pickLatestReport(dir, 'repostudio-upgrade-repair'),
  ]);

  const context = { dir, smoke, runtime, repair, upgradeRepair };
  const markdown = buildSummaryMarkdown(context);

  if (writeSummary && summaryFile) {
    await fsp.appendFile(summaryFile, markdown, 'utf8');
  }

  return {
    ok: true,
    dir,
    summaryFile: summaryFile || null,
    written: Boolean(writeSummary && summaryFile),
    found: {
      smoke: Boolean(smoke),
      runtime: Boolean(runtime),
      repair: Boolean(repair),
      upgradeRepair: Boolean(upgradeRepair),
    },
    markdown,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  summarizeSmokeReports(parseArgs())
    .then((result) => {
      if (!result.written || !result.summaryFile) {
        // eslint-disable-next-line no-console
        console.log(result.markdown);
      }
      // eslint-disable-next-line no-console
      console.log(`${JSON.stringify({
        ok: result.ok,
        dir: result.dir,
        summaryFile: result.summaryFile,
        written: result.written,
        found: result.found,
      }, null, 2)}\n`);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error || 'unknown error');
      if (process.env.CI === 'true') {
        // eslint-disable-next-line no-console
        console.error(`::warning title=desktop-smoke-summary::${message}`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`desktop smoke summary failed: ${message}`);
      }
      process.exitCode = 0;
    });
}

