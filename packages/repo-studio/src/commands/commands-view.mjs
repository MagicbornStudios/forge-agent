import {
  loadRepoStudioLocalOverrides,
  saveRepoStudioLocalOverrides,
} from '../lib/config.mjs';

function normalizeValue(value, fallback) {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

export async function runCommandsView(options = {}) {
  const localOverrides = await loadRepoStudioLocalOverrides();
  const nextView = {
    query: normalizeValue(options.query, ''),
    source: normalizeValue(options.source, 'all'),
    status: normalizeValue(options.status, 'all'),
    tab: normalizeValue(options.tab, 'recommended'),
    sort: normalizeValue(options.sort, 'id'),
  };

  const next = await saveRepoStudioLocalOverrides({
    ...(localOverrides || {}),
    commandView: nextView,
  });

  return {
    ok: true,
    commandView: next.commandView,
    message: 'Updated command view preferences.',
  };
}
