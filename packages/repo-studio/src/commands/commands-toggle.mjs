import {
  loadRepoStudioLocalOverrides,
  saveRepoStudioLocalOverrides,
} from '../lib/config.mjs';

export async function runCommandsToggle(options = {}) {
  const commandId = String(options.commandId || '').trim();
  if (!commandId) {
    throw new Error('Missing command id. Usage: forge-repo-studio commands-toggle <command-id> --enable|--disable');
  }

  const disabled = options.disabled === true;
  const localOverrides = await loadRepoStudioLocalOverrides();
  const current = new Set(
    Array.isArray(localOverrides?.commandPolicy?.disabledCommandIds)
      ? localOverrides.commandPolicy.disabledCommandIds
      : [],
  );

  if (disabled) current.add(commandId);
  else current.delete(commandId);

  const next = await saveRepoStudioLocalOverrides({
    ...(localOverrides || {}),
    commandPolicy: {
      ...(localOverrides?.commandPolicy || {}),
      disabledCommandIds: [...current].sort((a, b) => String(a).localeCompare(String(b))),
    },
  });

  return {
    ok: true,
    commandId,
    disabled,
    disabledCommandIds: next?.commandPolicy?.disabledCommandIds || [],
    message: disabled
      ? `Disabled command id: ${commandId}`
      : `Enabled command id: ${commandId}`,
  };
}
