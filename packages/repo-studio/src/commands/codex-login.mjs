import { loadRepoStudioConfig } from '../lib/config.mjs';
import { runCodexLogin } from '../lib/codex.mjs';

export async function runCodexLoginCommand(options = {}) {
  const config = await loadRepoStudioConfig();
  const result = await runCodexLogin(config, options);
  return {
    ...result,
    report: [
      '# RepoStudio Codex Login',
      '',
      `ok: ${result.ok ? 'true' : 'false'}`,
      `auth url: ${result.authUrl || '(none)'}`,
      `ready: ${result.readiness?.ok ? 'true' : 'false'}`,
      `missing: ${Array.isArray(result.readiness?.missing) && result.readiness.missing.length > 0 ? result.readiness.missing.join(', ') : '(none)'}`,
      `cli source: ${result.readiness?.cli?.source || 'unknown'}`,
      `cli invocation: ${result.readiness?.cli?.invocation?.display || result.readiness?.cli?.invocation?.command || '(unknown)'}`,
      `login: ${result.readiness?.login?.loggedIn ? result.readiness.login.authType : 'not-logged-in'}`,
      '',
      result.message || '',
    ].filter(Boolean).join('\n') + '\n',
  };
}
