/**
 * Forge codegen config for Studio (platform).
 * Single app-spec output; paths relative to app root (cwd when running codegen).
 */
export default {
  workspaceFiles: [
    { workspaceId: 'dialogue', filePath: 'components/workspaces/DialogueWorkspace.tsx' },
    { workspaceId: 'character', filePath: 'components/workspaces/CharacterWorkspace.tsx' },
    { workspaceId: 'strategy', filePath: 'components/workspaces/StrategyWorkspace.tsx' },
  ],
  appSpecOutputPath: 'lib/app-shell/app-spec.generated.ts',
  layoutIdPrefix: 'studio',
  panelKeyFormat: 'panel.visible.{workspaceId}-{panelId}',
  extraPanels: {
    dialogue: [
      { id: 'bottom', label: 'Bottom panel', key: 'panel.visible.dialogue-bottom' },
    ],
    strategy: [],
  },
  settingsExportName: 'APP_SETTINGS_DEFAULTS',
  settingsMergeDefaults: {},
};
