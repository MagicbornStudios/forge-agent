import type { RepoStudioConfig } from '@/lib/repo-studio-config';

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

export function resolveLoopAssistantEndpoint(config: RepoStudioConfig) {
  const route = config?.assistant?.routes?.loop;
  const mode = String(route?.mode || 'shared-runtime').trim().toLowerCase() || 'shared-runtime';
  const routePath = String(route?.routePath || config?.assistant?.routePath || '').trim();
  const envFallback = firstEnvProxyUrl();

  if (mode === 'shared-runtime' || mode === 'local') {
    return {
      ok: true,
      mode,
      endpoint: '',
      local: true,
      message: 'Using local shared-runtime loop assistant.',
    };
  }

  if (/^https?:\/\//i.test(routePath)) {
    return {
      ok: true,
      mode,
      endpoint: routePath,
      local: false,
      message: 'Using configured loop assistant endpoint.',
    };
  }

  if (routePath.startsWith('/')) {
    return {
      ok: true,
      mode,
      endpoint: '',
      local: true,
      message: `Using local loop assistant route (${routePath}).`,
    };
  }

  if (envFallback) {
    return {
      ok: true,
      mode,
      endpoint: envFallback,
      local: false,
      message: `Using environment loop assistant endpoint (${ENV_PROXY_KEYS.join(', ')}).`,
    };
  }

  return {
    ok: true,
    mode,
    local: true,
    endpoint: '',
    message: [
      'Loop assistant endpoint is not configured for proxy mode.',
      'Falling back to local shared-runtime loop assistant.',
      `Set assistant.routes.loop.routePath or one of: ${ENV_PROXY_KEYS.join(', ')} for proxy mode.`,
    ].join(' '),
  };
}
