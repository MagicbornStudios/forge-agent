'use client';

import { CodebaseAgentStrategyWorkspace } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function CodebaseAgentStrategyWorkspaceDemo() {
  return (
    <ShowcaseDemoSurface className="h-[640px] min-h-[420px] overflow-hidden p-0">
      <CodebaseAgentStrategyWorkspace />
    </ShowcaseDemoSurface>
  );
}
