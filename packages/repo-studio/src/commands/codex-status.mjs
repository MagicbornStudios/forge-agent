import { loadRepoStudioConfig } from '../lib/config.mjs';
import { getCodexStatus } from '../lib/codex.mjs';

export async function runCodexStatus() {
  const config = await loadRepoStudioConfig();
  const status = await getCodexStatus(config);
  return {
    ...status,
    report: [
      '# RepoStudio Codex Status',
      '',
      `ready: ${status.readiness.ok ? 'true' : 'false'}`,
      `missing: ${status.readiness.missing.length > 0 ? status.readiness.missing.join(', ') : '(none)'}`,
      `codex cli installed: ${status.readiness.cli.installed ? 'true' : 'false'}`,
      `codex version: ${status.readiness.cli.version || 'unknown'}`,
      `codex login: ${status.readiness.login?.loggedIn ? `${status.readiness.login.authType}` : 'not-logged-in'}`,
      `server running: ${status.running ? 'true' : 'false'}`,
      status.runtime?.wsUrl ? `server ws: ${status.runtime.wsUrl}` : null,
      status.runtime?.pid ? `server pid: ${status.runtime.pid}` : null,
    ].filter(Boolean).join('\n') + '\n',
  };
}
