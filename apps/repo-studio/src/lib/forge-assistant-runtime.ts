import {
  legacyAssistantConfigIssues,
  resolveForgeAssistantRoute,
  type RepoStudioConfig,
} from '@/lib/repo-studio-config';

const ENV_PROXY_KEYS = [
  'REPOSTUDIO_ASSISTANT_PROXY_URL',
  'ASSISTANT_CHAT_PROXY_URL',
  'OPENROUTER_ASSISTANT_PROXY_URL',
];

function firstEnvProxyUrl() {
  for (const key of ENV_PROXY_KEYS) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

export function resolveForgeAssistantEndpoint(config: RepoStudioConfig) {
  const issues = legacyAssistantConfigIssues(config);
  if (issues.length > 0) {
    return {
      ok: false,
      mode: 'invalid',
      endpoint: '',
      message: [
        'Legacy Repo Studio assistant config detected.',
        ...issues,
      ].join(' '),
    };
  }

  const route = resolveForgeAssistantRoute(config);
  const mode = String(route.mode || 'openrouter').trim().toLowerCase() || 'openrouter';
  const routePath = String(route.routePath || '').trim();
  const envFallback = firstEnvProxyUrl();

  if (mode === 'openrouter') {
    return {
      ok: true,
      mode,
      endpoint: '',
      message: 'Using built-in OpenRouter forge assistant runtime.',
    };
  }

  if (mode !== 'proxy') {
    return {
      ok: false,
      mode,
      endpoint: '',
      message: 'Invalid assistant.routes.forge.mode. Allowed values: "openrouter" or "proxy".',
    };
  }

  const endpoint = /^https?:\/\//i.test(routePath) ? routePath : envFallback;
  if (!endpoint) {
    return {
      ok: false,
      mode,
      endpoint: '',
      message: [
        'Forge proxy mode requires an absolute assistant.routes.forge.routePath (http/https).',
        `Or set one of: ${ENV_PROXY_KEYS.join(', ')}.`,
      ].join(' '),
    };
  }

  if (!/^https?:\/\//i.test(endpoint)) {
    return {
      ok: false,
      mode,
      endpoint: '',
      message: 'Forge proxy endpoint must be an absolute http(s) URL.',
    };
  }

  return {
    ok: true,
    mode,
    endpoint,
    message: 'Using configured forge assistant proxy endpoint.',
  };
}
