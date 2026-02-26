/**
 * Forge codegen config for Consumer Studio.
 * Single app-spec output; paths relative to app root (cwd when running codegen).
 */
export default {
  workspaceFiles: [
    { workspaceId: 'assistant', filePath: 'components/workspaces/ConsumerStudioWorkspace.tsx' },
  ],
  appSpecOutputPath: 'lib/app-spec.generated.ts',
  layoutIdPrefix: 'consumer-studio',
  panelKeyFormat: 'panel.visible.{workspaceId}-{panelId}',
  settingsExportName: 'APP_SETTINGS_DEFAULTS',
  settingsMergeDefaults: {},
};
