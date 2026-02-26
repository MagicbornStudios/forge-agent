function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildCommandRows(commands) {
  return Array.isArray(commands) ? commands : [];
}

function buildStatsMarkup(payload, analytics) {
  const status = payload?.status || 'unknown';
  const percent = Number(payload?.percent || 0);
  const nextAction = payload?.nextAction || 'forge-loop progress';
  const nextReason = payload?.nextReason || 'No reason supplied.';

  const taskStats = analytics?.tasks || {};
  const chips = [
    `Loop status: ${status}`,
    `Completion: ${percent}%`,
    `Tasks: ${taskStats.total || 0}`,
    `Open tasks: ${taskStats.pending || 0} pending / ${taskStats.in_progress || 0} in-progress`,
    `Summaries: ${analytics?.summaries || 0}`,
    `Verifications: ${analytics?.verifications || 0}`,
    `Open decisions: ${analytics?.decisionChecklistOpen || 0}`,
    `Open errors: ${analytics?.errorChecklistOpen || 0}`,
  ];

  return {
    chips: chips.map((chip) => `<span class="metric">${escapeHtml(chip)}</span>`).join(''),
    nextAction,
    nextReason,
  };
}

export function renderStudioHtml(model) {
  const initialView = model.view || 'planning';
  const commands = buildCommandRows(model.commands);
  const loopStats = buildStatsMarkup(model.loopPayload, model.loopAnalytics);
  const disabledCount = Array.isArray(model?.config?.commandPolicy?.disabledCommandIds)
    ? model.config.commandPolicy.disabledCommandIds.length
    : 0;
  const assistant = model.assistant || {};
  const recentRuns = Array.isArray(model.recentRuns) ? model.recentRuns : [];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>RepoStudio</title>
  <style>
    :root {
      --bg: #070d1a;
      --bg-2: #0a1528;
      --panel: #111e36;
      --panel-2: #0f1a2f;
      --line: #22365c;
      --line-2: #1b2e4f;
      --text: #e8eefc;
      --muted: #9cb0d1;
      --ok: #34d399;
      --warn: #f59e0b;
      --bad: #ef4444;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: radial-gradient(1200px 700px at 90% -10%, #18315d 0%, var(--bg) 62%); color: var(--text); font-family: ui-sans-serif, system-ui, sans-serif; }
    .shell { min-height: 100vh; display: grid; grid-template-rows: auto auto 1fr; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .7rem .9rem; border-bottom: 1px solid var(--line); background: #0b172d; }
    .brand { font-size: 1.03rem; font-weight: 700; letter-spacing: .03em; }
    .muted { color: var(--muted); font-size: .82rem; }
    .cadence { display: flex; gap: .35rem; flex-wrap: wrap; }
    .tabs { display: flex; gap: .4rem; padding: .6rem .75rem; border-bottom: 1px solid var(--line); background: #0e1a33; flex-wrap: wrap; }
    .tabs button { border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--text); padding: .34rem .72rem; cursor: pointer; }
    .tabs button.active { border-color: #77d2ff; background: var(--panel); }
    .workspace { display: grid; grid-template-columns: 1fr 330px; min-height: 0; }
    .main { overflow: auto; padding: .9rem; }
    .sidebar { overflow: auto; border-left: 1px solid var(--line); background: #0c1730; padding: .9rem; }
    .panel { display: none; border: 1px solid var(--line); border-radius: 12px; padding: .85rem; background: linear-gradient(180deg, rgba(18,33,60,.93), rgba(13,24,42,.93)); }
    .panel.active { display: block; }
    .row { display: flex; gap: .45rem; flex-wrap: wrap; margin-bottom: .6rem; }
    .row > * { min-height: 30px; }
    button { border: 1px solid var(--line); border-radius: 8px; background: #162746; color: var(--text); padding: .35rem .62rem; cursor: pointer; }
    button:hover { border-color: #66d6ff; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    input, select, textarea { border: 1px solid var(--line); border-radius: 8px; background: #091427; color: var(--text); padding: .35rem .5rem; }
    textarea { width: 100%; min-height: 92px; resize: vertical; }
    pre { white-space: pre-wrap; word-break: break-word; border: 1px solid var(--line-2); border-radius: 8px; padding: .67rem; background: rgba(5,12,24,.65); max-height: 46vh; overflow: auto; }
    table { width: 100%; border-collapse: collapse; font-size: .86rem; }
    th, td { text-align: left; border-bottom: 1px solid var(--line-2); padding: .42rem; vertical-align: top; }
    code { color: #a7d0ff; }
    .metric { display: inline-flex; align-items: center; border: 1px solid var(--line-2); border-radius: 999px; padding: .2rem .58rem; font-size: .75rem; margin: 0 .32rem .32rem 0; }
    .list-wrap { max-height: 48vh; overflow: auto; border: 1px solid var(--line-2); border-radius: 9px; }
    .ok { color: var(--ok); }
    .warn { color: var(--warn); }
    .bad { color: var(--bad); }
    .section-title { margin: 0 0 .5rem; font-size: .95rem; }
    .tiny { font-size: .75rem; color: var(--muted); }
    .history { max-height: 28vh; overflow: auto; border: 1px solid var(--line-2); border-radius: 9px; }
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div>
        <div class="brand">RepoStudio</div>
        <div class="muted">Profile: ${escapeHtml(model.profile)} | Mode: ${escapeHtml(model.mode)} | Theme: ${escapeHtml(model?.config?.ui?.defaultTheme || 'dark')}</div>
      </div>
      <div class="cadence">
        <button class="tiny" data-copy-cmd="forge-loop progress">progress</button>
        <button class="tiny" data-copy-cmd="forge-loop discuss-phase ${escapeHtml(model?.loopPayload?.rows?.[0]?.phaseNumber || '1')}">discuss</button>
        <button class="tiny" data-copy-cmd="forge-loop plan-phase ${escapeHtml(model?.loopPayload?.rows?.[0]?.phaseNumber || '1')}">plan</button>
        <button class="tiny" data-copy-cmd="forge-loop execute-phase ${escapeHtml(model?.loopPayload?.rows?.[0]?.phaseNumber || '1')}">execute</button>
        <button class="tiny" data-copy-cmd="forge-loop verify-work ${escapeHtml(model?.loopPayload?.rows?.[0]?.phaseNumber || '1')} --strict">verify</button>
        <button class="tiny" data-copy-cmd="forge-loop sync-legacy">sync</button>
      </div>
      <label class="muted"><input id="confirm-toggle" type="checkbox" checked /> confirm runs</label>
    </header>

    <nav class="tabs">
      <button data-view="planning">Planning</button>
      <button data-view="env">Env</button>
      <button data-view="commands">Commands</button>
      <button data-view="assistant">Assistant</button>
    </nav>

    <section class="workspace">
      <main class="main">
        <section id="view-planning" class="panel">
          <h2 class="section-title">Planning Console</h2>
          <div id="loop-metrics">${loopStats.chips}</div>
          <div class="row">
            <button id="loop-refresh">Refresh Progress</button>
            <button id="loop-copy-next">Copy Next Command</button>
          </div>
          <p class="tiny">Next: <code id="loop-next">${escapeHtml(loopStats.nextAction)}</code></p>
          <p class="tiny">Reason: <span id="loop-reason">${escapeHtml(loopStats.nextReason)}</span></p>
          <pre id="loop-output">${escapeHtml(model.loopReport || 'No forge-loop report yet.')}</pre>
        </section>

        <section id="view-env" class="panel">
          <h2 class="section-title">Env Readiness</h2>
          <div class="row">
            <button id="env-refresh">Doctor</button>
            <button id="env-reconcile">Reconcile --write --sync-examples</button>
          </div>
          <pre id="env-output">${escapeHtml(model.envReport || 'No env report yet.')}</pre>
        </section>

        <section id="view-commands" class="panel">
          <h2 class="section-title">Command Center</h2>
          <p class="tiny">Allowlist + confirm + deny-pattern policy enforced. View state is persisted to local overrides.</p>
          <div class="row">
            <input id="command-search" placeholder="Search by id/command/source..." />
            <select id="command-tab">
              <option value="recommended">Recommended</option>
              <option value="all">All Allowlisted</option>
              <option value="blocked">Blocked</option>
            </select>
            <select id="command-source"><option value="all">All sources</option></select>
            <select id="command-status">
              <option value="all">Any status</option>
              <option value="allowed">Allowed</option>
              <option value="blocked">Blocked</option>
            </select>
            <select id="command-sort">
              <option value="id">Sort: id</option>
              <option value="source">Sort: source</option>
              <option value="command">Sort: command</option>
            </select>
          </div>
          <div class="row" id="command-metrics"></div>
          <div class="list-wrap">
            <table>
              <thead><tr><th>ID</th><th>Source</th><th>Command</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody id="command-table-body"></tbody>
            </table>
          </div>
          <h3 class="section-title" style="margin-top:.8rem;">Terminal Output</h3>
          <pre id="command-output">No command run yet.</pre>
          <h3 class="section-title" style="margin-top:.8rem;">Recent Runs</h3>
          <div class="history">
            <table>
              <thead><tr><th>When</th><th>ID</th><th>Code</th><th>Status</th></tr></thead>
              <tbody id="history-table-body"></tbody>
            </table>
          </div>
        </section>

        <section id="view-assistant" class="panel">
          <h2 class="section-title">Assistant</h2>
          <p class="tiny">Route mode: <code id="assistant-route-mode">${escapeHtml(assistant.routeMode || 'local')}</code> | Route: <code id="assistant-route-path">${escapeHtml(assistant.routePath || '/api/assistant-chat')}</code></p>
          <p class="tiny">Model: <code>${escapeHtml(assistant.defaultModel || 'openrouter/auto')}</code></p>
          <p id="assistant-status" class="${assistant.ready ? 'ok' : 'warn'}">${escapeHtml(assistant.message || 'No assistant status available.')}</p>
          <div class="row">
            <button id="assistant-refresh">Refresh Status</button>
          </div>
          <textarea id="assistant-input" placeholder="Ask RepoStudio assistant..."></textarea>
          <div class="row">
            <button id="assistant-send">Send</button>
          </div>
          <pre id="assistant-output">No assistant response yet.</pre>
        </section>
      </main>

      <aside class="sidebar">
        <h3 class="section-title">Settings</h3>
        <p class="tiny">Right sidebar is reserved for policy/settings only.</p>
        <label class="tiny">Profile<br/><input id="profile-input" value="${escapeHtml(model.profile)}" /></label><br/><br/>
        <label class="tiny">Mode<br/>
          <select id="mode-select">
            <option value="local">local</option>
            <option value="preview">preview</option>
            <option value="production">production</option>
            <option value="headless">headless</option>
          </select>
        </label>
        <hr style="border-color: var(--line); margin:.9rem 0;" />
        <p class="tiny">Disabled command IDs: <strong>${disabledCount}</strong></p>
        <p class="tiny">Use the commands table to enable/disable per-command policy.</p>
      </aside>
    </section>
  </div>

  <script>
    const state = {
      view: ${JSON.stringify(initialView)},
      profile: ${JSON.stringify(model.profile)},
      mode: ${JSON.stringify(model.mode)},
      loopNext: ${JSON.stringify(loopStats.nextAction || 'forge-loop progress')},
      commands: ${JSON.stringify(commands)},
      recentRuns: ${JSON.stringify(recentRuns)},
      commandView: ${JSON.stringify(model.commandView || { query: '', source: 'all', status: 'all', tab: 'recommended', sort: 'id' })},
    };

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    const panels = {
      planning: document.getElementById('view-planning'),
      env: document.getElementById('view-env'),
      commands: document.getElementById('view-commands'),
      assistant: document.getElementById('view-assistant'),
    };

    function setView(view) {
      state.view = view;
      document.querySelectorAll('[data-view]').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
      for (const [key, panel] of Object.entries(panels)) {
        panel.classList.toggle('active', key === view);
      }
    }

    document.querySelectorAll('[data-view]').forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view)));

    function clipboardCopy(text) {
      if (!text) return;
      navigator.clipboard?.writeText(text).catch(() => {});
    }

    document.querySelectorAll('[data-copy-cmd]').forEach((btn) => {
      btn.addEventListener('click', () => clipboardCopy(btn.dataset.copyCmd));
    });

    document.getElementById('loop-copy-next').addEventListener('click', () => clipboardCopy(state.loopNext));

    document.getElementById('mode-select').value = state.mode;
    document.getElementById('mode-select').addEventListener('change', (event) => { state.mode = event.target.value; });
    document.getElementById('profile-input').addEventListener('change', (event) => {
      state.profile = String(event.target.value || '').trim() || state.profile;
    });

    async function postJson(url, body) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      const payload = await response.json().catch(() => ({ ok: false, message: 'Invalid JSON response.' }));
      return { ok: response.ok, payload };
    }

    async function getJson(url) {
      const response = await fetch(url);
      const payload = await response.json().catch(() => ({ ok: false, message: 'Invalid JSON response.' }));
      return { ok: response.ok, payload };
    }

    function setOutput(targetId, parts) {
      const text = (parts || []).filter(Boolean).join('\\n\\n').trim();
      document.getElementById(targetId).textContent = text || 'No output.';
    }

    document.getElementById('env-refresh').addEventListener('click', async () => {
      const result = await postJson('/api/env/doctor', { profile: state.profile, mode: state.mode });
      const payload = result.payload || {};
      setOutput('env-output', [
        payload.report,
        payload.stderr,
        payload.resolvedAttempt ? ('resolved: ' + payload.resolvedAttempt) : '',
      ]);
    });

    document.getElementById('env-reconcile').addEventListener('click', async () => {
      const result = await postJson('/api/env/reconcile', { profile: state.profile, mode: state.mode });
      const payload = result.payload || {};
      setOutput('env-output', [
        payload.report || payload.stdout,
        payload.stderr,
        payload.command ? ('command: ' + payload.command) : '',
      ]);
    });

    document.getElementById('loop-refresh').addEventListener('click', async () => {
      const result = await postJson('/api/loop/progress', {});
      const payload = result.payload || {};
      const report = payload.report || '';
      const next = payload.payload?.nextAction || 'forge-loop progress';
      const reason = payload.payload?.nextReason || 'No reason supplied.';
      state.loopNext = next;
      document.getElementById('loop-next').textContent = next;
      document.getElementById('loop-reason').textContent = reason;
      setOutput('loop-output', [report, payload.stderr]);
    });

    const commandSearch = document.getElementById('command-search');
    const commandTab = document.getElementById('command-tab');
    const commandSource = document.getElementById('command-source');
    const commandStatus = document.getElementById('command-status');
    const commandSort = document.getElementById('command-sort');
    const commandMetrics = document.getElementById('command-metrics');
    const commandBody = document.getElementById('command-table-body');
    const commandOutput = document.getElementById('command-output');
    const historyBody = document.getElementById('history-table-body');

    commandSearch.value = state.commandView.query || '';
    commandTab.value = state.commandView.tab || 'recommended';
    commandSource.value = state.commandView.source || 'all';
    commandStatus.value = state.commandView.status || 'all';
    commandSort.value = state.commandView.sort || 'id';

    function hydrateSourceOptions() {
      const seen = new Set(['all']);
      for (const item of state.commands) {
        if (seen.has(item.source)) continue;
        seen.add(item.source);
        const option = document.createElement('option');
        option.value = item.source;
        option.textContent = item.source;
        commandSource.appendChild(option);
      }
      commandSource.value = state.commandView.source || 'all';
    }

    function commandMatches(item) {
      const query = String(commandSearch.value || '').toLowerCase().trim();
      const tab = commandTab.value || 'recommended';
      const source = commandSource.value || 'all';
      const status = commandStatus.value || 'all';

      if (tab === 'recommended' && !item.recommended) return false;
      if (tab === 'all' && item.blocked) return false;
      if (tab === 'blocked' && !item.blocked) return false;
      if (source !== 'all' && item.source !== source) return false;
      if (status === 'allowed' && item.blocked) return false;
      if (status === 'blocked' && !item.blocked) return false;

      if (!query) return true;
      const hay = (item.id + ' ' + item.command + ' ' + item.source).toLowerCase();
      return hay.includes(query);
    }

    function persistCommandView() {
      state.commandView = {
        query: commandSearch.value || '',
        source: commandSource.value || 'all',
        status: commandStatus.value || 'all',
        tab: commandTab.value || 'recommended',
        sort: commandSort.value || 'id',
      };
      postJson('/api/commands/view', state.commandView).catch(() => {});
    }

    function renderHistory() {
      historyBody.innerHTML = (state.recentRuns || []).map((run) => {
        const status = run.ok ? 'ok' : 'failed';
        const klass = run.ok ? 'ok' : 'bad';
        return '<tr>'
          + '<td class="tiny">' + escapeHtml(String(run.timestamp || '')) + '</td>'
          + '<td><code>' + escapeHtml(String(run.id || '')) + '</code></td>'
          + '<td>' + escapeHtml(String(run.code ?? '')) + '</td>'
          + '<td class="' + klass + '">' + escapeHtml(status) + '</td>'
          + '</tr>';
      }).join('');
    }

    function sortCommands(list) {
      const sortKey = commandSort.value || 'id';
      const copy = [...list];
      copy.sort((a, b) => String(a[sortKey] || '').localeCompare(String(b[sortKey] || '')));
      return copy;
    }

    function renderCommandMetrics(visible) {
      const total = state.commands.length;
      const blocked = state.commands.filter((item) => item.blocked).length;
      const allowed = total - blocked;
      commandMetrics.innerHTML = [
        '<span class="metric">Visible: ' + visible.length + '</span>',
        '<span class="metric">Allowed: ' + allowed + '</span>',
        '<span class="metric">Blocked: ' + blocked + '</span>',
      ].join('');
    }

    async function runCommand(commandId) {
      const confirmed = document.getElementById('confirm-toggle').checked;
      const result = await postJson('/api/commands/run', { commandId, confirm: confirmed });
      const payload = result.payload || {};
      setOutput('command-output', [payload.command, payload.stdout, payload.stderr, payload.message]);
      if (Array.isArray(payload.recentRuns)) {
        state.recentRuns = payload.recentRuns;
        renderHistory();
      }
    }

    async function toggleCommand(commandId, disabled) {
      const result = await postJson('/api/commands/toggle', { commandId, disabled });
      if (!(result.payload || {}).ok) {
        setOutput('command-output', [result.payload?.message || 'Unable to update command toggle.']);
        return;
      }
      window.location.reload();
    }

    function renderCommands() {
      const visible = sortCommands(state.commands.filter(commandMatches));
      renderCommandMetrics(visible);

      commandBody.innerHTML = visible.map((item) => {
        const statusLabel = item.blocked
          ? (item.blockedBy === 'deny-pattern' ? 'blocked (deny)' : 'blocked (disabled)')
          : 'allowed';
        const statusClass = item.blocked ? 'bad' : 'ok';
        const runDisabled = item.blocked ? 'disabled' : '';
        const toggleDisabled = item.blockedBy === 'deny-pattern' ? 'disabled' : '';
        const toggleToDisabled = item.blocked ? 'false' : 'true';
        const toggleLabel = item.blockedBy === 'deny-pattern'
          ? 'Denied'
          : (item.blocked ? 'Enable' : 'Disable');

        return '<tr>'
          + '<td><code>' + escapeHtml(item.id) + '</code></td>'
          + '<td>' + escapeHtml(item.source) + '</td>'
          + '<td><code>' + escapeHtml(item.command) + '</code></td>'
          + '<td class="' + statusClass + '">' + escapeHtml(statusLabel) + '</td>'
          + '<td>'
          + '<button data-run="' + escapeHtml(item.id) + '" ' + runDisabled + '>Run</button> '
          + '<button data-toggle="' + escapeHtml(item.id) + '" data-disabled="' + escapeHtml(toggleToDisabled) + '" ' + toggleDisabled + '>' + escapeHtml(toggleLabel) + '</button>'
          + '</td>'
          + '</tr>';
      }).join('');

      commandBody.querySelectorAll('[data-run]').forEach((btn) => {
        btn.addEventListener('click', () => runCommand(btn.dataset.run));
      });

      commandBody.querySelectorAll('[data-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => toggleCommand(btn.dataset.toggle, btn.dataset.disabled === 'true'));
      });
    }

    [commandSearch, commandTab, commandSource, commandStatus, commandSort].forEach((node) => {
      node.addEventListener('input', () => {
        persistCommandView();
        renderCommands();
      });
      node.addEventListener('change', () => {
        persistCommandView();
        renderCommands();
      });
    });

    document.getElementById('assistant-refresh').addEventListener('click', async () => {
      const response = await getJson('/api/assistant/status');
      const assistant = response.payload?.assistant || {};
      document.getElementById('assistant-route-mode').textContent = assistant.routeMode || 'local';
      document.getElementById('assistant-route-path').textContent = assistant.routePath || '/api/assistant-chat';
      const status = document.getElementById('assistant-status');
      status.textContent = assistant.message || 'No status available.';
      status.className = assistant.ready ? 'ok' : 'warn';
    });

    document.getElementById('assistant-send').addEventListener('click', async () => {
      const input = String(document.getElementById('assistant-input').value || '').trim();
      if (!input) return;
      const response = await postJson('/api/assistant/chat', { input });
      const payload = response.payload || {};
      const text = payload.message || payload.error || JSON.stringify(payload, null, 2);
      setOutput('assistant-output', [text]);
    });

    hydrateSourceOptions();
    renderCommands();
    renderHistory();
    setView(state.view);
  </script>
</body>
</html>`;
}
