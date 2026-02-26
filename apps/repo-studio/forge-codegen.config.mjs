/**
 * Forge codegen config for repo-studio.
 * Single app-spec output: workspaces, layout definitions, settings defaults, pinned panels.
 * Paths relative to app root (cwd when running codegen).
 */
const WORKSPACE_FILE_MAP = {
  planning: 'PlanningWorkspace.tsx',
  env: 'EnvWorkspace.tsx',
  commands: 'CommandsWorkspace.tsx',
  story: 'StoryWorkspace.tsx',
  database: 'DatabaseWorkspace.tsx',
  git: 'GitWorkspace.tsx',
  assistant: 'AssistantWorkspace.tsx',
  diff: 'DiffWorkspace.tsx',
  code: 'CodeWorkspace.tsx',
  'review-queue': 'ReviewQueueWorkspace.tsx',
};

export default {
  appId: 'repo-studio',
  appLabel: 'Repo Studio',
  workspaceFiles: Object.entries(WORKSPACE_FILE_MAP).map(([workspaceId, fileName]) => ({
    workspaceId,
    filePath: `src/components/workspaces/${fileName}`,
  })),
  appSpecOutputPath: 'src/lib/app-spec.generated.ts',
  layoutIdPrefix: 'repo',
  panelKeyPrefix: 'panel.visible.repo',
  fallbackWorkspaceId: 'planning',
  pinnedPanelIds: ['viewport'],
  settingsRegistryPath: 'src/lib/settings/registry.ts',
  settingsExportName: 'REPO_SETTINGS_GENERATED_DEFAULTS',
  settingsMergeDefaults: {
    commands: {
      view: {
        query: '',
        source: 'all',
        status: 'all',
        tab: 'recommended',
        sort: 'id',
      },
      disabledCommandIds: [],
    },
    panels: { hiddenPanelIds: [] },
    loops: { activeLoopId: 'default' },
    assistant: {
      prompts: {
        byLoop: {
          default: {
            forgeAssistant: '',
            codexAssistant: '',
          },
        },
      },
    },
  },
};
