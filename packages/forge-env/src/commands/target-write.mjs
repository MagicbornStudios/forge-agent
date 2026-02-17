import { writeEnvTargetValues } from '../lib/target-service.mjs';

function parseValues(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(String(raw));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    throw new Error('Invalid --values JSON. Expected object: {"KEY":"value"}');
  }
}

export async function runTargetWrite(options = {}) {
  const targetId = String(options.targetId || options.app || '').trim();
  if (!targetId) {
    throw new Error('targetId is required. Usage: forge-env target-write <targetId> --values \'{"KEY":"value"}\'');
  }

  const values = options.values && typeof options.values === 'object'
    ? options.values
    : parseValues(options.values);

  const result = await writeEnvTargetValues({
    profile: options.profile,
    targetId,
    mode: options.mode || 'local',
    values,
    runner: options.runner,
  });

  return result;
}

