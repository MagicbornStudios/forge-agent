export type RepoSettingsFieldType = 'text' | 'textarea' | 'select' | 'toggle';

export type RepoSettingsFieldOption = {
  label: string;
  value: string;
};

export type RepoSettingsFieldRegistration = {
  key: string;
  label: string;
  type: RepoSettingsFieldType;
  description?: string;
  options?: RepoSettingsFieldOption[];
  defaultValue: string | boolean;
};

export type RepoSettingsSectionRegistration = {
  id: string;
  title: string;
  fields: RepoSettingsFieldRegistration[];
};

export const REPO_SETTINGS_SECTIONS: RepoSettingsSectionRegistration[] = [
  {
    id: 'runtime',
    title: 'Runtime',
    fields: [
      {
        key: 'env.profile',
        label: 'Profile',
        type: 'text',
        description: 'Active Forge Env profile.',
        defaultValue: 'forge-agent',
      },
      {
        key: 'env.mode',
        label: 'Mode',
        type: 'select',
        options: [
          { label: 'local', value: 'local' },
          { label: 'preview', value: 'preview' },
          { label: 'production', value: 'production' },
          { label: 'headless', value: 'headless' },
        ],
        defaultValue: 'local',
      },
      {
        key: 'commands.confirmRuns',
        label: 'Confirm command runs',
        type: 'toggle',
        defaultValue: true,
      },
    ],
  },
  {
    id: 'platform',
    title: 'Platform',
    fields: [
      {
        key: 'platform.baseUrl',
        label: 'Base URL',
        type: 'text',
        description: 'Studio API base URL for desktop auth validation.',
        defaultValue: '',
      },
      {
        key: 'platform.autoValidate',
        label: 'Auto validate on connect',
        type: 'toggle',
        defaultValue: true,
      },
      {
        key: 'platform.lastStatus',
        label: 'Last status',
        type: 'text',
        description: 'Latest connection status marker.',
        defaultValue: 'disconnected',
      },
      {
        key: 'platform.lastValidatedAt',
        label: 'Last validated',
        type: 'text',
        description: 'ISO timestamp from the most recent validation.',
        defaultValue: '',
      },
    ],
  },
  {
    id: 'review-queue',
    title: 'Review Queue',
    fields: [
      {
        key: 'reviewQueue.trustMode',
        label: 'Trust mode',
        type: 'select',
        options: [
          { label: 'Require approval', value: 'require-approval' },
          { label: 'Auto approve all', value: 'auto-approve-all' },
        ],
        description: 'Global proposal handling policy.',
        defaultValue: 'require-approval',
      },
      {
        key: 'reviewQueue.autoApplyEnabled',
        label: 'Auto apply enabled',
        type: 'toggle',
        description: 'Derived helper value. True only for auto-approve-all.',
        defaultValue: false,
      },
      {
        key: 'reviewQueue.lastAutoApplyAt',
        label: 'Last auto apply',
        type: 'text',
        description: 'Timestamp of the most recent automatic proposal apply.',
        defaultValue: '',
      },
    ],
  },
  {
    id: 'assistants',
    title: 'Assistants',
    fields: [
      {
        key: 'assistant.prompts.loopAssistant',
        label: 'Loop Assistant System Prompt',
        type: 'textarea',
        description: 'Applied to loop assistant before user prompt and @planning mentions.',
        defaultValue: '',
      },
      {
        key: 'assistant.prompts.codexAssistant',
        label: 'Codex Assistant System Prompt',
        type: 'textarea',
        description: 'Applied to codex assistant before user prompt and @planning mentions.',
        defaultValue: '',
      },
    ],
  },
];

function setByPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = String(path || '').split('.').filter(Boolean);
  if (!parts.length) return;
  let cursor: Record<string, unknown> = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index];
    const current = cursor[key];
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

export function buildRepoSettingsDefaultsFromRegistry() {
  const defaults: Record<string, unknown> = {};
  for (const section of REPO_SETTINGS_SECTIONS) {
    for (const field of section.fields) {
      setByPath(defaults, field.key, field.defaultValue);
    }
  }
  return defaults;
}
