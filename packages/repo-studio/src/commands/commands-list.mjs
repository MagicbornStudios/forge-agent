import {
  loadRepoStudioConfig,
  loadRepoStudioLocalOverrides,
} from '../lib/config.mjs';
import { buildAllowedCommands } from '../lib/policy.mjs';

function mergeDisabledIds(config, localOverrides) {
  const fromConfig = Array.isArray(config?.commandPolicy?.disabledCommandIds)
    ? config.commandPolicy.disabledCommandIds
    : [];
  const fromLocal = Array.isArray(localOverrides?.commandPolicy?.disabledCommandIds)
    ? localOverrides.commandPolicy.disabledCommandIds
    : [];
  return [...new Set([...fromConfig, ...fromLocal])];
}

export async function runCommandsList() {
  const config = await loadRepoStudioConfig();
  const localOverrides = await loadRepoStudioLocalOverrides();
  const mergedConfig = {
    ...config,
    commandPolicy: {
      ...(config?.commandPolicy || {}),
      disabledCommandIds: mergeDisabledIds(config, localOverrides),
    },
  };
  const commands = await buildAllowedCommands(mergedConfig);
  return {
    ok: true,
    commandCount: commands.length,
    blockedCount: commands.filter((item) => item.blocked).length,
    commands,
    commandView: localOverrides?.commandView || null,
    disabledCommandIds: mergedConfig.commandPolicy.disabledCommandIds,
  };
}
