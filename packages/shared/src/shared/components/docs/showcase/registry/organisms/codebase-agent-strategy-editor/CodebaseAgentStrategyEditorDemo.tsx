'use client';

import { CodebaseAgentStrategyEditor } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function CodebaseAgentStrategyEditorDemo() {
  return (
    <ShowcaseDemoSurface className="h-[640px] min-h-[420px] overflow-hidden p-0">
      <CodebaseAgentStrategyEditor />
    </ShowcaseDemoSurface>
  );
}
