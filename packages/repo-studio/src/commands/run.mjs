import {
  loadRepoStudioConfig,
  loadRepoStudioLocalOverrides,
  saveRepoStudioLocalOverrides,
} from '../lib/config.mjs';
import { buildAllowedCommands, resolveAllowedCommand } from '../lib/policy.mjs';
import { runCommand } from '../lib/process.mjs';

export async function runCommandById(options = {}) {
  const commandId = String(options.commandId || '').trim();
  if (!commandId) {
    throw new Error('Missing command id. Usage: forge-repo-studio run <command-id> --confirm');
  }

  const baseConfig = await loadRepoStudioConfig();
  const localOverrides = await loadRepoStudioLocalOverrides();
  const disabled = [
    ...(Array.isArray(baseConfig?.commandPolicy?.disabledCommandIds) ? baseConfig.commandPolicy.disabledCommandIds : []),
    ...(Array.isArray(localOverrides?.commandPolicy?.disabledCommandIds) ? localOverrides.commandPolicy.disabledCommandIds : []),
  ];
  const config = {
    ...baseConfig,
    commandPolicy: {
      ...(baseConfig?.commandPolicy || {}),
      disabledCommandIds: [...new Set(disabled)],
    },
  };
  const requireConfirm = config.commandPolicy?.requireConfirm !== false;
  if (requireConfirm && options.confirm !== true) {
    return {
      ok: false,
      message: 'Confirmation required. Re-run with --confirm.',
    };
  }

  const commands = await buildAllowedCommands(config);
  const entry = resolveAllowedCommand(commands, commandId);
  if (!entry) {
    return {
      ok: false,
      message: `Unknown command id: ${commandId}`,
    };
  }
  if (entry.blocked) {
    const reason = entry.blockedBy === 'disabled-id'
      ? `Command is disabled by id: ${commandId}`
      : `Command blocked by deny patterns: ${entry.command}`;
    return {
      ok: false,
      message: reason,
    };
  }

  const result = runCommand(entry.command);
  await saveRepoStudioLocalOverrides({
    ...(localOverrides || {}),
    recentRuns: [
      {
        id: commandId,
        command: result.command,
        ok: result.ok,
        code: result.code,
        timestamp: new Date().toISOString(),
      },
      ...(Array.isArray(localOverrides?.recentRuns) ? localOverrides.recentRuns : []),
    ].slice(0, 50),
  });
  return {
    ok: result.ok,
    command: result.command,
    stdout: result.stdout,
    stderr: result.stderr,
    code: result.code,
  };
}
