'use client';

import * as React from 'react';
import { CodebaseAgentStrategyEditor } from '../../../assistant-ui/CodebaseAgentStrategyEditor';
import { ShowcaseDemoSurface } from './harnesses';

type DemoRenderer = () => React.JSX.Element;

function CodebaseAgentStrategyEditorDemo() {
  return (
    <ShowcaseDemoSurface className="h-[640px] min-h-[420px] overflow-hidden p-0">
      <CodebaseAgentStrategyEditor />
    </ShowcaseDemoSurface>
  );
}

export const ORGANISM_SHOWCASE_DEMOS: Record<string, DemoRenderer> = {
  'codebase-agent-strategy-editor': CodebaseAgentStrategyEditorDemo,
};

