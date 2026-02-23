/**
 * Generated defaults for RepoStudio settings.
 * In Phase 05 this is source-controlled; later phases can move this to registry-driven codegen.
 */
export const REPO_SETTINGS_GENERATED_DEFAULTS = {
  env: {
    profile: 'forge-agent',
    mode: 'local',
  },
  commands: {
    confirmRuns: true,
    view: {
      query: '',
      source: 'all',
      status: 'all',
      tab: 'recommended',
      sort: 'id',
    },
    disabledCommandIds: [],
  },
  panels: {
    hiddenPanelIds: [],
  },
  loops: {
    activeLoopId: 'default',
  },
  platform: {
    baseUrl: '',
    autoValidate: true,
    lastStatus: 'disconnected',
    lastValidatedAt: '',
  },
  reviewQueue: {
    trustMode: 'require-approval',
    autoApplyEnabled: false,
    lastAutoApplyAt: '',
  },
  assistant: {
    prompts: {
      byLoop: {
        default: {
          loopAssistant: '',
          codexAssistant: '',
        },
      },
    },
  },
} as const;
