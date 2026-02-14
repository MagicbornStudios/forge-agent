import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';

import { collectProjectState, evaluateReadiness, reconcileProject } from '../lib/engine.mjs';
import { resolveProfile } from '../lib/profiles.mjs';

const HOST = '127.0.0.1';
const DEFAULT_PORT = 3847;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseFormPayload(payload) {
  const overrides = {};
  for (const [name, value] of Object.entries(payload || {})) {
    const match = /^(.*?)::(.+)$/.exec(name);
    if (!match) continue;
    const target = match[1];
    const key = match[2];
    if (!overrides[target]) overrides[target] = {};
    overrides[target][key] = String(value || '').trim();
  }
  return overrides;
}

function groupEntriesBySection(entries) {
  const grouped = new Map();
  for (const entry of entries) {
    const section = entry.section || 'custom';
    if (!grouped.has(section)) grouped.set(section, []);
    grouped.get(section).push(entry);
  }
  return grouped;
}

function renderTargetEditor(targetState, sectionMeta) {
  const bySection = groupEntriesBySection(targetState.entries);
  const knownKeys = new Set(targetState.entries.map((entry) => entry.key));

  for (const key of targetState.unionKeys) {
    if (knownKeys.has(key)) continue;
    if (!bySection.has('custom')) bySection.set('custom', []);
    bySection.get('custom').push({
      key,
      section: 'custom',
      description: 'Discovered from existing env files.',
      secret: false,
    });
  }

  const lines = [
    '<section class="target-panel">',
    `<h3>${escapeHtml(targetState.target.label || targetState.target.id)}</h3>`,
    `<p class="meta">${escapeHtml(targetState.target.id)} - ${targetState.unionKeys.length} keys</p>`,
  ];

  for (const [section, entries] of bySection.entries()) {
    const meta = sectionMeta?.[section] || {};
    lines.push('<div class="section">');
    lines.push(`<h4>${escapeHtml(meta.title || section)}</h4>`);
    if (meta.description) {
      lines.push(`<p class="meta">${escapeHtml(meta.description)}</p>`);
    }

    for (const entry of entries) {
      const name = `${targetState.target.id}::${entry.key}`;
      const value = targetState.mergedValues[entry.key] ?? '';
      const type = entry.secret ? 'password' : 'text';
      const required = Array.isArray(entry.requiredIn) && entry.requiredIn.length > 0 ? 'required' : '';
      const source = targetState.provenance[entry.key] || 'unknown';

      lines.push('<label class="field">');
      lines.push(`<span class="key">${escapeHtml(entry.key)}</span>`);
      lines.push(`<input type="${type}" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${required} />`);
      lines.push(`<span class="hint">${escapeHtml(entry.description || '')}</span>`);
      lines.push(`<span class="hint">source: ${escapeHtml(source)}</span>`);
      lines.push('</label>');
    }

    lines.push('</div>');
  }

  lines.push('</section>');
  return lines.join('\n');
}

function renderHtml(model) {
  const missingLines = model.readiness.missing.length > 0
    ? model.readiness.missing.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>No missing required keys.</li>';

  const conflictLines = model.readiness.conflicts.length > 0
    ? model.readiness.conflicts.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>No conflicting values detected.</li>';

  const headlessOk = model.headless.ok ? 'ready' : 'missing requirements';
  const targetEditors = model.state.targets
    .map((target) => renderTargetEditor(target, model.profile.config.sectionMeta?.[target.target.id]))
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>forge-env portal</title>
  <style>
    :root { --bg:#0b1020; --surface:#131a2b; --text:#f4f7ff; --muted:#9aa6bf; --accent:#22c55e; --line:#27314a; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: radial-gradient(circle at top right, #1f2b48 0%, #0b1020 60%); color: var(--text); }
    main { max-width: 1200px; margin: 0 auto; padding: 1.2rem; }
    h1 { margin: 0 0 .4rem; font-size: 1.2rem; }
    .meta { color: var(--muted); font-size: .85rem; margin: .2rem 0 .7rem; }
    .tabs { display:flex; gap:.4rem; margin:1rem 0; flex-wrap: wrap; }
    .tabs button { background:transparent; color:var(--text); border:1px solid var(--line); border-radius:999px; padding:.35rem .8rem; cursor:pointer; }
    .tabs button.active { background:var(--surface); border-color:var(--accent); }
    .tab { display:none; background: rgba(19,26,43,.86); border:1px solid var(--line); border-radius:12px; padding:1rem; }
    .tab.active { display:block; }
    ul { margin:0; padding-left:1.2rem; }
    .target-grid { display:grid; gap:1rem; }
    .target-panel { border:1px solid var(--line); border-radius:10px; padding:.8rem; background:rgba(11,16,32,.55); }
    .section { margin-bottom:1rem; }
    .section h4 { margin:.4rem 0; font-size:.9rem; }
    .field { display:block; margin:.65rem 0; }
    .field input { width:100%; padding:.45rem .55rem; border:1px solid var(--line); border-radius:7px; background:#0e162a; color:var(--text); }
    .key { display:block; font-weight:600; font-size:.82rem; }
    .hint { display:block; color:var(--muted); font-size:.73rem; margin-top:.2rem; }
    .actions { margin-top:1rem; display:flex; gap:.5rem; }
    .actions button { border:0; border-radius:8px; padding:.55rem .9rem; cursor:pointer; }
    .actions .save { background: var(--accent); color:#08210f; font-weight:700; }
    .actions .refresh { background: #334155; color:#fff; }
    .status { margin-top:.7rem; font-size:.85rem; }
  </style>
</head>
<body>
  <main>
    <h1>forge-env portal</h1>
    <p class="meta">profile: ${escapeHtml(model.profile.profile)} - mode: ${escapeHtml(model.mode)} - headless: ${escapeHtml(headlessOk)}</p>

    <div class="tabs">
      <button type="button" data-tab="missing" class="active">Missing Required</button>
      <button type="button" data-tab="conflicts">Conflicts</button>
      <button type="button" data-tab="targets">Targets</button>
      <button type="button" data-tab="headless">Headless Readiness</button>
    </div>

    <section id="tab-missing" class="tab active">
      <ul>${missingLines}</ul>
    </section>

    <section id="tab-conflicts" class="tab">
      <ul>${conflictLines}</ul>
    </section>

    <section id="tab-targets" class="tab">
      <form id="env-form">
        <div class="target-grid">${targetEditors}</div>
        <div class="actions">
          <button type="submit" class="save">Save</button>
          <button type="button" class="refresh" id="refresh">Refresh</button>
        </div>
      </form>
      <div class="status" id="status"></div>
    </section>

    <section id="tab-headless" class="tab">
      <p>${model.headless.ok ? 'Headless requirements are satisfied.' : 'Headless requirements are not satisfied yet.'}</p>
      <ul>${model.headless.missing.length > 0 ? model.headless.missing.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '<li>No missing headless requirements.</li>'}</ul>
    </section>
  </main>

  <script>
    const buttons = [...document.querySelectorAll('[data-tab]')];
    const tabs = [...document.querySelectorAll('.tab')];
    const status = document.getElementById('status');

    function activate(tab) {
      buttons.forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
      tabs.forEach((node) => node.classList.toggle('active', node.id === 'tab-' + tab));
    }

    buttons.forEach((button) => button.addEventListener('click', () => activate(button.dataset.tab)));
    document.getElementById('refresh')?.addEventListener('click', () => window.location.reload());

    document.getElementById('env-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = {};
      const formData = new FormData(event.currentTarget);
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await response.json();

      if (payload.ok) {
        status.textContent = payload.message || 'Saved.';
        if (payload.close === true) {
          status.textContent = 'Saved and validated. This window can be closed.';
        } else {
          setTimeout(() => window.location.reload(), 350);
        }
      } else {
        status.textContent = (payload.errors || [payload.message || 'Save failed']).join(' | ');
      }
    });
  </script>
</body>
</html>`;
}

function parseJsonFromOutput(output) {
  const raw = String(output || '').trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    // Some runners prepend logs. Attempt to parse trailing JSON object.
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function readRepoStudioRuntime() {
  const runtimePath = path.join(process.cwd(), '.repo-studio', 'runtime.json');
  try {
    const raw = fs.readFileSync(runtimePath, 'utf8');
    const parsed = JSON.parse(raw);
    const port = Number(parsed?.port || 0);
    return {
      ...parsed,
      url: port > 0 ? `http://127.0.0.1:${port}` : null,
    };
  } catch {
    return null;
  }
}

function runAttempt(attempt) {
  const result = spawnSync(attempt.command, attempt.args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: attempt.shell === true,
  });

  const stderr = [String(result.stderr || '').trim(), result.error?.message || '']
    .filter(Boolean)
    .join('\n')
    .trim();

  return {
    ok: (result.status ?? 1) === 0,
    code: result.status ?? 1,
    command: `${attempt.command} ${(attempt.args || []).join(' ')}`.trim(),
    stdout: String(result.stdout || ''),
    stderr,
    spawnFailed: Boolean(result.error),
  };
}

function launchRepoStudio(options = {}) {
  const profile = options.profile || 'forge-loop';
  const mode = options.mode || 'local';
  const baseArgs = ['open', '--view', 'env', '--mode', mode, '--profile', profile, '--reuse', '--json'];
  const localCliPath = path.join(process.cwd(), 'packages', 'repo-studio', 'src', 'cli.mjs');

  const attempts = [];
  if (fs.existsSync(localCliPath)) {
    attempts.push({ command: process.execPath, args: [localCliPath, ...baseArgs], shell: false });
  }
  attempts.push({ command: 'pnpm', args: ['run', 'forge-repo-studio', '--', ...baseArgs], shell: false });
  attempts.push({ command: 'pnpm', args: ['exec', 'forge-repo-studio', ...baseArgs], shell: false });
  attempts.push({ command: 'forge-repo-studio', args: baseArgs, shell: false });
  attempts.push(process.platform === 'win32'
    ? { command: 'cmd.exe', args: ['/d', '/s', '/c', ['pnpm', 'forge-repo-studio', ...baseArgs].join(' ')], shell: false }
    : { command: 'pnpm', args: ['forge-repo-studio', ...baseArgs], shell: false });

  for (const attempt of attempts) {
    const result = runAttempt(attempt);
    if (result.ok) {
      const payload = parseJsonFromOutput(result.stdout);
      const runtime = payload || readRepoStudioRuntime();
      return {
        ok: true,
        command: result.command,
        payload: runtime,
        stdout: result.stdout,
      };
    }

    if (!result.spawnFailed) {
      return {
        ok: false,
        command: result.command,
        stderr: result.stderr,
        stdout: result.stdout,
      };
    }
  }

  return { ok: false, command: '', stderr: 'Unable to launch RepoStudio.' };
}

async function loadPortalModel(profileId, mode, app, overrides = null) {
  const profile = await resolveProfile({ profile: profileId });
  const state = await collectProjectState(profile.config, {
    app,
    overrides: overrides || undefined,
  });
  const readiness = evaluateReadiness(state, mode, {
    profileFallback: profile.config.profileFallback || 'accept-satisfied',
  });
  const headless = evaluateReadiness(state, 'headless', {
    profileFallback: profile.config.profileFallback || 'accept-satisfied',
  });

  return { profile, state, readiness, headless, mode };
}

export async function runPortal(options = {}) {
  const mode = options.mode || 'local';
  const bootstrap = options.bootstrap === true;
  const profileId = options.profile;
  const app = options.app;
  const port = Number(options.port || DEFAULT_PORT);
  const legacyPortal = options.legacyPortal === true;

  if (!legacyPortal && !bootstrap) {
    const launched = launchRepoStudio({
      profile: profileId,
      mode,
    });
    if (launched.ok) {
      const url = launched.payload?.url || null;
      const pid = launched.payload?.pid || null;
      const runtimeMode = launched.payload?.mode || null;
      return {
        ok: true,
        launchedRepoStudio: true,
        closed: false,
        url,
        pid,
        runtimeMode,
        message: `RepoStudio env workspace ready via: ${launched.command}${url ? ` (${url})` : ''}${pid ? ` pid=${pid}` : ''}${runtimeMode ? ` mode=${runtimeMode}` : ''}`,
      };
    }
    return {
      ok: false,
      launchedRepoStudio: false,
      closed: false,
      message: `Failed to launch RepoStudio env workspace. ${launched.stderr || ''}`.trim(),
    };
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    if (url.pathname !== '/') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    if (req.method === 'GET') {
      const model = await loadPortalModel(profileId, mode, app);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(renderHtml(model));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }

      let parsed;
      try {
        parsed = JSON.parse(body || '{}');
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Invalid JSON body.' }));
        return;
      }

      const profile = await resolveProfile({ profile: profileId });
      const overrides = parseFormPayload(parsed);
      const reconciled = await reconcileProject(profile.config, {
        app,
        mode,
        write: true,
        syncExamples: true,
        overrides,
      });

      const close = bootstrap && reconciled.readiness.ok;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: reconciled.readiness.ok,
        close,
        message: reconciled.readiness.ok
          ? 'Saved env files.'
          : `Missing required keys: ${reconciled.readiness.missing.join(', ')}`,
        errors: reconciled.readiness.ok ? [] : reconciled.readiness.missing,
      }));

      if (close) {
        setTimeout(() => server.close(), 100);
      }
      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  });

  await new Promise((resolve) => server.listen(port, HOST, resolve));
  const url = `http://${HOST}:${port}`;
  console.log(`[forge-env:portal] Open ${url}`);

  const shouldOpenBrowser = options.openBrowser !== false && (bootstrap || options.openBrowser === true);
  if (shouldOpenBrowser) {
    const launcher = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    spawn(launcher, [url], { stdio: 'ignore', shell: process.platform === 'win32' });
  }

  if (bootstrap) {
    await new Promise((resolve) => server.on('close', resolve));
    return { ok: true, closed: true, url };
  }

  return { ok: true, closed: false, url };
}
