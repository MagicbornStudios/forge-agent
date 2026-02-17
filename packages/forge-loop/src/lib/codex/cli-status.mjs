import { spawnSync } from 'node:child_process';

function runSync(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    shell: options.shell === true,
    timeout: options.timeoutMs || 120000,
  });

  return {
    ok: (result.status ?? 1) === 0,
    status: result.status ?? 1,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error ? String(result.error.message || result.error) : '',
  };
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

function parseLoginOutput(output) {
  const text = normalizeWhitespace(output).toLowerCase();
  if (!text) return { loggedIn: false, authType: 'none' };
  if (text.includes('logged in using chatgpt')) return { loggedIn: true, authType: 'chatgpt' };
  if (text.includes('logged in')) return { loggedIn: true, authType: 'other' };
  if (text.includes('not logged in')) return { loggedIn: false, authType: 'none' };
  return { loggedIn: false, authType: 'unknown' };
}

export function getCodexCliStatus(command = 'codex') {
  const version = runSync(command, ['--version']);
  return {
    installed: version.ok,
    command,
    version: normalizeWhitespace(version.stdout || version.stderr),
    details: version,
  };
}

export function getCodexLoginStatus(command = 'codex') {
  const status = runSync(command, ['login', 'status']);
  const parsed = parseLoginOutput(`${status.stdout}\n${status.stderr}`);
  return {
    ...parsed,
    ok: status.ok,
    details: status,
  };
}

export function getCodexAppServerStatus(command = 'codex') {
  const status = runSync(command, ['app-server', '--help']);
  return {
    reachable: status.ok,
    details: status,
  };
}

export function evaluateCodexRuntimeReadiness(runtimeSettings = {}) {
  const codex = runtimeSettings?.codex || {};
  const command = String(codex.command || 'codex').trim() || 'codex';
  const cli = getCodexCliStatus(command);
  const login = cli.installed ? getCodexLoginStatus(command) : null;
  const appServer = cli.installed ? getCodexAppServerStatus(command) : null;

  const issues = [];
  if (!cli.installed) issues.push('codex_cli_missing');
  if (!login?.loggedIn) issues.push('codex_login_missing');
  if (!appServer?.reachable) issues.push('codex_app_server_unreachable');

  return {
    ok: issues.length === 0,
    issues,
    command,
    cli,
    login,
    appServer,
  };
}
