import { loadRepoStudioSnapshot, type RepoCommandEntry } from '@/lib/repo-data';
import { readRepoStudioConfig } from '@/lib/repo-studio-config';
import { resolveRepoRoot } from '@/lib/repo-files';
import { getRepoSettingsSnapshot } from '@/lib/settings/repository';

export type RepoCommandPolicyEntry = RepoCommandEntry & {
  blocked?: boolean;
  blockedBy?: string | null;
  recommended?: boolean;
};

type RepoCommandView = {
  query: string;
  source: string;
  status: string;
  tab: string;
  sort: string;
};

type LoadCommandsModelOptions = {
  workspaceId?: string;
  loopId?: string;
};

type LoadCommandsModelResult = {
  ok: boolean;
  commands: RepoCommandPolicyEntry[];
  disabledCommandIds: string[];
  commandView: RepoCommandView;
  requireConfirm: boolean;
};

const SOURCE_PRIORITY: Record<string, number> = {
  'forge-builtins': 0,
  'root-scripts': 1,
  'workspace-scripts': 2,
};

function normalizeCommandView(input: unknown): RepoCommandView {
  const value = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return {
    query: String(value.query || ''),
    source: String(value.source || 'all'),
    status: String(value.status || 'all'),
    tab: String(value.tab || 'recommended'),
    sort: String(value.sort || 'id'),
  };
}

function includesDenied(command: string, patterns: string[]) {
  const text = String(command || '').toLowerCase();
  return patterns.some((pattern) => text.includes(String(pattern || '').toLowerCase()));
}

function dedupeCommands(entries: RepoCommandEntry[]) {
  const byCommand = new Map<string, { entry: RepoCommandEntry; score: number }>();
  for (const entry of entries) {
    const key = String(entry.command || '').trim().toLowerCase();
    if (!key) continue;
    const score = SOURCE_PRIORITY[entry.source] ?? 99;
    const existing = byCommand.get(key);
    if (!existing || score < existing.score) {
      byCommand.set(key, { entry, score });
    }
  }
  return [...byCommand.values()].map((item) => item.entry);
}

export async function loadCommandsModel(options: LoadCommandsModelOptions = {}): Promise<LoadCommandsModelResult> {
  const repoRoot = resolveRepoRoot();
  const workspaceId = String(options.workspaceId || 'planning');
  const loopId = String(options.loopId || 'default');
  const [snapshot, config, settings] = await Promise.all([
    loadRepoStudioSnapshot(repoRoot, { loopId }),
    readRepoStudioConfig(),
    getRepoSettingsSnapshot({ workspaceId, loopId }),
  ]);

  const merged = settings.merged as Record<string, any>;
  const mergedCommands = (merged?.commands && typeof merged.commands === 'object')
    ? merged.commands
    : {};

  const sources = Array.isArray(config?.commandPolicy?.sources)
    ? config.commandPolicy.sources
    : ['root-scripts', 'workspace-scripts', 'forge-builtins'];
  const defaultSources = Array.isArray(config?.commandPolicy?.defaultSources)
    ? config.commandPolicy.defaultSources
    : ['forge-builtins', 'root-scripts'];
  const denyPatterns = Array.isArray(config?.commandPolicy?.denyPatterns)
    ? config.commandPolicy.denyPatterns
    : [];
  const sourceSet = new Set(sources.map((item) => String(item)));
  const defaultSourceSet = new Set(defaultSources.map((item) => String(item)));
  const disabledCommandIds = Array.isArray(mergedCommands.disabledCommandIds)
    ? mergedCommands.disabledCommandIds.map((item: unknown) => String(item)).filter(Boolean)
    : [];
  const disabledSet = new Set(disabledCommandIds);

  const filteredBySource = snapshot.commands.filter((entry) => sourceSet.has(entry.source));
  const deduped = dedupeCommands(filteredBySource);

  const commands: RepoCommandPolicyEntry[] = deduped
    .map((entry) => {
      const denied = includesDenied(entry.command, denyPatterns);
      const disabled = disabledSet.has(entry.id);
      return {
        ...entry,
        blocked: denied || disabled,
        blockedBy: denied ? 'deny-pattern' : (disabled ? 'disabled-id' : null),
        recommended: entry.id.startsWith('forge:') || defaultSourceSet.has(entry.source),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const requireConfirm = typeof mergedCommands.confirmRuns === 'boolean'
    ? mergedCommands.confirmRuns
    : config?.commandPolicy?.requireConfirm !== false;

  return {
    ok: true,
    commands,
    disabledCommandIds,
    commandView: normalizeCommandView(mergedCommands.view),
    requireConfirm,
  };
}
