import { collectWorkspaceScripts } from './workspace.mjs';

function includesAny(text, patterns) {
  const haystack = String(text || '').toLowerCase();
  return (patterns || []).some((pattern) => haystack.includes(String(pattern || '').toLowerCase()));
}

export async function buildAllowedCommands(config, cwd = process.cwd()) {
  const policy = config?.commandPolicy || {};
  const sourceSet = new Set(Array.isArray(policy.sources) ? policy.sources : []);
  const defaultSourceSet = new Set(Array.isArray(policy.defaultSources) ? policy.defaultSources : []);
  const denyPatterns = Array.isArray(policy.denyPatterns) ? policy.denyPatterns : [];
  const disabledIds = new Set(Array.isArray(policy.disabledCommandIds) ? policy.disabledCommandIds : []);

  const collected = await collectWorkspaceScripts(cwd);
  const candidates = [
    ...(sourceSet.has('root-scripts') ? collected.rootEntries : []),
    ...(sourceSet.has('workspace-scripts') ? collected.workspaceEntries : []),
    ...(sourceSet.has('forge-builtins') ? collected.forgeEntries : []),
  ];

  const sourcePriority = {
    'forge-builtins': 0,
    'root-scripts': 1,
    'workspace-scripts': 2,
  };

  // Keep one entry per command string, preferring forge built-ins over root/workspace duplicates.
  const byCommand = new Map();
  for (const item of candidates) {
    const key = String(item.command || '').trim().toLowerCase();
    const score = sourcePriority[item.source] ?? 10;
    const existing = byCommand.get(key);
    if (!existing || score < existing.score) {
      byCommand.set(key, { item, score });
    }
  }

  const dedupeById = new Map();
  for (const { item } of byCommand.values()) {
    if (!dedupeById.has(item.id)) dedupeById.set(item.id, item);
  }

  return [...dedupeById.values()]
    .map((item) => {
      const denied = includesAny(`${item.command} ${item.script || ''}`, denyPatterns);
      const disabled = disabledIds.has(item.id);
      return {
        ...item,
        blocked: denied || disabled,
        blockedBy: denied ? 'deny-pattern' : (disabled ? 'disabled-id' : null),
        recommended: item.id.startsWith('forge:') || defaultSourceSet.has(item.source),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function resolveAllowedCommand(commands, commandId) {
  return (commands || []).find((item) => item.id === commandId) || null;
}
