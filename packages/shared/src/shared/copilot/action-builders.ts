import type { Parameter } from '@copilotkit/shared';
import type { CopilotActionConfig } from './types';

function withPrefix<T extends Parameter[] | []>(
  prefix: string,
  config: CopilotActionConfig<T>,
): CopilotActionConfig<T> {
  const name = config.name.startsWith(prefix) ? config.name : `${prefix}${config.name}`;
  return { ...config, name };
}

export function createAppAction<T extends Parameter[] | []>(
  config: CopilotActionConfig<T>,
): CopilotActionConfig<T> {
  return withPrefix('app_', config);
}

export function createDomainAction<T extends Parameter[] | []>(
  domain: string,
  config: CopilotActionConfig<T>,
): CopilotActionConfig<T> {
  return withPrefix(`${domain}_`, config);
}
