#!/usr/bin/env node

/**
 * Env portal: localhost-only web UI for editing .env.local for Studio and Platform.
 * Used by pnpm env:portal (standalone) or env:bootstrap (when keys missing).
 *
 * --bootstrap: after successful save, server exits 0 so parent can retry check.
 */

import http from 'node:http';
import { createInterface } from 'node:readline';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  APP_CONFIG,
  ENV_MANIFEST,
  SECTION_META,
} from './manifest.mjs';
import {
  asString,
  buildEnvFile,
  getManifestEntries,
  isEntryRequiredForMode,
  isValueSet,
  parseArgs,
  pickUnknownKeys,
  readEnvFile,
  resolveRepoPath,
  writeTextFile,
} from './lib.mjs';
import { runSync } from './vercel-sync.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3847;
const HOST = '127.0.0.1';
const VERCEL_KEYS = [
  { key: 'VERCEL_API_TOKEN', secret: true, desc: 'Vercel API token for env sync.' },
  { key: 'VERCEL_TEAM_ID', secret: false, desc: 'Optional team ID (for teams).' },
  { key: 'VERCEL_PROJECT_STUDIO', secret: false, desc: 'Studio project id or name.' },
  { key: 'VERCEL_PROJECT_PLATFORM', secret: false, desc: 'Platform project id or name.' },
];
const VERCEL_CONFIG_PATH = resolveRepoPath('.env.vercel.local');

/**
 * @param {Record<string, string>} studioValues
 * @param {Record<string, string>} platformValues
 * @param {Array<{app: string, key: string, requiredIn?: string[], dependsOn?: object}>} entries
 */
function collectMissingRequired(studioValues, platformValues, entries) {
  const missing = [];
  const merged = { ...studioValues, ...platformValues };
  for (const entry of entries) {
    if (!isEntryRequiredForMode(entry, 'local', merged)) continue;
    const appValues = entry.app === 'studio' ? studioValues : platformValues;
    if (!isValueSet(appValues[entry.key])) {
      missing.push(`${entry.app}:${entry.key}`);
    }
  }
  return missing;
}

/**
 * @param {{app: string, key: string, section: string, description: string, exampleDefault?: string, secret?: boolean}[]} entries
 */
function groupBySection(entries) {
  const bySection = new Map();
  for (const entry of entries) {
    if (!bySection.has(entry.section)) {
      bySection.set(entry.section, []);
    }
    bySection.get(entry.section).push(entry);
  }
  return bySection;
}

/**
 * @param {'studio'|'platform'} app
 * @param {Map<string, {app: string, key: string, section: string, description: string, exampleDefault?: string, secret?: boolean}[]>} bySection
 * @param {Record<string, string>} values
 */
function renderAppForm(app, bySection, values) {
  const config = APP_CONFIG[app];
  const meta = SECTION_META[app] ?? {};
  const sections = Array.from(bySection.keys());
  let html = `<fieldset class="app-form" data-app="${app}">
    <legend>${config.label}</legend>`;

  for (const section of sections) {
    const sectionEntries = bySection.get(section) ?? [];
    if (sectionEntries.length === 0) continue;
    const sm = meta[section] ?? {};
    html += `
    <div class="section">
      <h3>${sm.title ?? section}</h3>
      ${sm.description ? `<p class="section-desc">${sm.description}</p>` : ''}`;

    for (const entry of sectionEntries) {
      const val = values[entry.key] ?? asString(entry.exampleDefault) ?? '';
      const inputType = entry.secret ? 'password' : 'text';
      const required = entry.requiredIn?.includes('local') ? 'required' : '';
      const placeholder = entry.exampleDefault ? ` placeholder="${asString(entry.exampleDefault).replace(/"/g, '&quot;')}"` : '';
      html += `
      <div class="field">
        <label for="${app}-${entry.key}">${entry.key}</label>
        <input type="${inputType}" id="${app}-${entry.key}" name="${app}::${entry.key}" value="${String(val).replace(/"/g, '&quot;').replace(/</g, '&lt;')}" ${required}${placeholder} />
        <span class="help">${entry.description}</span>
      </div>`;
    }
    html += `
    </div>`;
  }
  html += `
  </fieldset>`;
  return html;
}

/**
 * @param {Record<string, string>} vercelValues
 */
function renderVercelForm(vercelValues) {
  let html = `<fieldset class="app-form" data-app="vercel">
    <legend>Vercel sync (optional)</legend>
    <p class="section-desc">Fill these to sync env to Vercel projects. Stored in <code>.env.vercel.local</code> (gitignored).</p>`;
  for (const { key, secret, desc } of VERCEL_KEYS) {
    const val = vercelValues[key] ?? '';
    const inputType = secret ? 'password' : 'text';
    html += `
    <div class="field">
      <label for="vercel-${key}">${key}</label>
      <input type="${inputType}" id="vercel-${key}" name="vercel::${key}" value="${String(val).replace(/"/g, '&quot;').replace(/</g, '&lt;')}" />
      <span class="help">${desc}</span>
    </div>`;
  }
  html += `
    <div class="actions" style="margin-top:0.75rem">
      <button type="button" id="sync-vercel" class="secondary">Sync to Vercel</button>
    </div>
  </fieldset>`;
  return html;
}

function renderHtml(studioValues, platformValues, vercelValues) {
  const studioEntries = getManifestEntries('studio');
  const platformEntries = getManifestEntries('platform');
  const studioBySection = groupBySection(studioEntries);
  const platformBySection = groupBySection(platformEntries);

  const studioForm = renderAppForm('studio', studioBySection, studioValues);
  const platformForm = renderAppForm('platform', platformBySection, platformValues);
  const vercelForm = renderVercelForm(vercelValues);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Forge Env Setup</title>
  <style>
    :root { --bg: #0c0c0f; --fg: #e4e4e7; --accent: #6366f1; --muted: #71717a; --surface: #18181b; --border: #27272a; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--fg); margin: 0; padding: 1.5rem; line-height: 1.5; }
    h1 { font-size: 1.25rem; margin: 0 0 1rem; }
    h2 { font-size: 1rem; margin: 1.5rem 0 0.5rem; color: var(--accent); }
    h3 { font-size: 0.9rem; margin: 1rem 0 0.5rem; color: var(--muted); }
    .section-desc { font-size: 0.8rem; color: var(--muted); margin: -0.25rem 0 0.5rem; }
    .app-form { border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: var(--surface); }
    .section { margin-bottom: 1rem; }
    .field { margin-bottom: 0.75rem; }
    .field label { display: block; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.25rem; }
    .field input { width: 100%; max-width: 32rem; padding: 0.5rem 0.75rem; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; color: var(--fg); font-size: 0.875rem; }
    .field input:focus { outline: none; border-color: var(--accent); }
    .help { display: block; font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; }
    .actions { margin-top: 1.5rem; display: flex; gap: 0.5rem; }
    button { padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.875rem; cursor: pointer; }
    button.primary { background: var(--accent); color: white; border: none; }
    button.primary:hover { opacity: 0.9; }
    button.secondary { background: transparent; color: var(--fg); border: 1px solid var(--border); }
    .message { margin: 1rem 0; padding: 0.75rem; border-radius: 6px; font-size: 0.875rem; }
    .message.error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); }
    .message.success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); }
  </style>
</head>
<body>
  <h1>Forge Env Setup</h1>
  <p>Configure environment variables for Studio and Platform. Required keys are marked. Save writes to <code>.env.local</code> in each app directory.</p>
  <div id="message"></div>
  <form id="env-form">
    <h2>Studio</h2>
    ${studioForm}
    <h2>Platform</h2>
    ${platformForm}
    <h2>Vercel</h2>
    ${vercelForm}
    <div class="actions">
      <button type="submit" class="primary">Save</button>
    </div>
  </form>

  <script>
    const form = document.getElementById('env-form');
    const messageEl = document.getElementById('message');
    function showMessage(text, type) {
      messageEl.innerHTML = '<div class="message ' + type + '">' + text + '</div>';
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const body = {};
      for (const [k, v] of fd) body[k] = v;
      try {
        const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.ok) {
          showMessage(data.message || 'Saved successfully.', 'success');
          if (data.continue) window.location.reload();
        } else {
          showMessage((data.errors || [data.message]).join(' ') || 'Save failed.', 'error');
        }
      } catch (err) {
        showMessage('Request failed: ' + err.message, 'error');
      }
    });
    document.getElementById('sync-vercel')?.addEventListener('click', async () => {
      try {
        const res = await fetch('/sync', { method: 'POST' });
        const data = await res.json();
        if (data.ok) {
          const lines = (data.results || []).map(r => r.key + ': ' + (r.ok ? 'ok' : 'fail'));
          showMessage('Sync complete. ' + lines.join('; '), 'success');
        } else {
          showMessage(data.message || 'Sync failed.', 'error');
        }
      } catch (err) {
        showMessage('Sync failed: ' + err.message, 'error');
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Parse POST body: { "studio::KEY": "val", "platform::KEY": "val", "vercel::KEY": "val" }
 */
function parseFormBody(body) {
  const studio = {};
  const platform = {};
  const vercel = {};
  for (const [rawKey, value] of Object.entries(body)) {
    if (typeof value !== 'string') continue;
    const match = /^(studio|platform|vercel)::(.+)$/.exec(rawKey);
    if (!match) continue;
    const app = match[1];
    const key = match[2];
    if (app === 'studio') studio[key] = value.trim();
    else if (app === 'platform') platform[key] = value.trim();
    else vercel[key] = value.trim();
  }
  return { studio, platform, vercel };
}

async function handleSave(studioValues, platformValues, vercelValues, bootstrapMode) {
  const allEntries = [...getManifestEntries('studio'), ...getManifestEntries('platform')];
  const missing = collectMissingRequired(studioValues, platformValues, allEntries);
  if (missing.length > 0) {
    return { ok: false, errors: [`Missing required keys: ${missing.join(', ')}`] };
  }

  const merged = { ...studioValues, ...platformValues };
  for (const app of ['studio', 'platform']) {
    const config = APP_CONFIG[app];
    const entries = getManifestEntries(app);
    const values = app === 'studio' ? studioValues : platformValues;
    const envPath = resolveRepoPath(config.envLocalPath);
    const existing = await readEnvFile(envPath);
    const orderedKeys = entries.map((e) => e.key);
    const extras = pickUnknownKeys(existing.values, orderedKeys);
    /** @type {Record<string, string>} */
    const selected = {};
    for (const key of orderedKeys) {
      const val = values[key];
      const entry = entries.find((e) => e.key === key);
      const required = entry ? isEntryRequiredForMode(entry, 'local', merged) : false;
      if (required || isValueSet(val)) {
        selected[key] = val ?? '';
      }
    }
    const content = buildEnvFile(
      ['# Generated by env portal.', '# Source of truth: scripts/env/manifest.mjs'],
      selected,
      orderedKeys,
      extras,
    );
    await writeTextFile(envPath, content);
  }

  if (Object.keys(vercelValues).length > 0) {
    const lines = ['# Vercel sync config (gitignored)', ''];
    for (const { key } of VERCEL_KEYS) {
      if (key in vercelValues) {
        lines.push(`${key}=${vercelValues[key] ?? ''}`);
      }
    }
    await writeTextFile(VERCEL_CONFIG_PATH, lines.join('\n') + '\n');
  }

  return {
    ok: true,
    message: 'Saved to apps/studio/.env.local and apps/platform/.env.local.',
    continue: bootstrapMode,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const bootstrapMode = options.bootstrap === true;

  const studioConfig = APP_CONFIG.studio;
  const platformConfig = APP_CONFIG.platform;
  const [studioEnv, platformEnv, vercelEnv] = await Promise.all([
    readEnvFile(resolveRepoPath(studioConfig.envLocalPath)),
    readEnvFile(resolveRepoPath(platformConfig.envLocalPath)),
    readEnvFile(VERCEL_CONFIG_PATH),
  ]);
  const studioValues = studioEnv.values;
  const platformValues = platformEnv.values;
  const vercelValues = vercelEnv.values;

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/sync' && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      try {
        const result = await runSync();
        const results = [
          ...result.studio.results.map((r) => ({ key: `studio:${r.key}`, ok: r.ok })),
          ...result.platform.results.map((r) => ({ key: `platform:${r.key}`, ok: r.ok })),
        ];
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, results }));
      } catch (err) {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            ok: false,
            message: err instanceof Error ? err.message : String(err),
          }),
        );
      }
      return;
    }

    if (pathname !== '/' || (req.method !== 'GET' && req.method !== 'POST')) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    res.setHeader('Content-Type', req.method === 'POST' ? 'application/json' : 'text/html');

    if (req.method === 'GET') {
      const [s, p, v] = await Promise.all([
        readEnvFile(resolveRepoPath(studioConfig.envLocalPath)),
        readEnvFile(resolveRepoPath(platformConfig.envLocalPath)),
        readEnvFile(VERCEL_CONFIG_PATH),
      ]);
      const html = renderHtml(s.values, p.values, v.values);
      res.writeHead(200);
      res.end(html);
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Invalid JSON body' }));
        return;
      }
      const { studio, platform, vercel } = parseFormBody(parsed);
      const result = await handleSave(studio, platform, vercel ?? {}, bootstrapMode);
      res.writeHead(200);
      res.end(JSON.stringify(result));
      if (result.ok && bootstrapMode) {
        setTimeout(() => server.close(), 100);
      }
    }
  });

  server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log(`[env:portal] Open ${url}`);
    if (bootstrapMode) {
      const open = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      spawn(open, [url], { stdio: 'ignore', shell: process.platform === 'win32' });
    }
  });

  if (!bootstrapMode) {
    return;
  }
  server.on('close', () => process.exit(0));
}

main().catch((err) => {
  console.error('[env:portal]', err);
  process.exit(1);
});
