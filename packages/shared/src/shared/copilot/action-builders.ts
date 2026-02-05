import type { CopilotActionConfig } from './types';

function withPrefix(prefix: string, config: CopilotActionConfig): CopilotActionConfig {
  const name = config.name.startsWith(prefix) ? config.name : `${prefix}${config.name}`;
  return { ...config, name };
}

export function createAppAction(config: CopilotActionConfig): CopilotActionConfig {
  return withPrefix('app_', config);
}

export function createWorkspaceAction(config: CopilotActionConfig): CopilotActionConfig {
  return withPrefix('workspace_', config);
}

export function createEditorAction(config: CopilotActionConfig): CopilotActionConfig {
  return withPrefix('editor_', config);
}

export function createDomainAction(domain: string, config: CopilotActionConfig): CopilotActionConfig {
  return withPrefix(`${domain}_`, config);
}
