import { getEnvTargetSnapshot } from '../lib/target-service.mjs';

export async function runTargetRead(options = {}) {
  const targetId = String(options.targetId || options.app || '').trim();
  if (!targetId) {
    throw new Error('targetId is required. Usage: forge-env target-read <targetId> [--profile ...] [--mode ...]');
  }

  const snapshot = await getEnvTargetSnapshot({
    profile: options.profile,
    targetId,
    mode: options.mode || 'local',
    runner: options.runner,
  });

  return {
    ok: true,
    targetId: snapshot.target.id,
    profile: snapshot.profile,
    mode: snapshot.mode,
    scope: snapshot.scope,
    entries: snapshot.entries,
    readiness: snapshot.readiness,
    aliasWarning: snapshot.aliasWarning,
  };
}

