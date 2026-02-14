import { FORGE_ENV_CONFIG_PATH, normalizeProfileId } from '../lib/constants.mjs';
import { readJson, writeJson } from '../lib/io.mjs';
import { defaultProfileConfig } from '../lib/profiles.mjs';

export async function runInit(options = {}) {
  const profileInput = options.profile || 'forge-loop';
  const normalized = normalizeProfileId(profileInput);
  const existing = await readJson(FORGE_ENV_CONFIG_PATH, null);

  if (existing && options.force !== true) {
    return {
      ok: true,
      created: false,
      profile: existing.profile || normalized.profile,
      path: FORGE_ENV_CONFIG_PATH,
      message: '.forge-env/config.json already exists. Use --force to rewrite defaults.',
      warning: normalized.alias ? 'Profile alias "generic" is deprecated; using "forge-loop".' : null,
    };
  }

  const defaults = defaultProfileConfig(normalized.profile);
  await writeJson(FORGE_ENV_CONFIG_PATH, defaults);

  return {
    ok: true,
    created: true,
    profile: normalized.profile,
    path: FORGE_ENV_CONFIG_PATH,
    message: 'Initialized forge-env config.',
    warning: normalized.alias ? 'Profile alias "generic" is deprecated; using "forge-loop".' : null,
  };
}

