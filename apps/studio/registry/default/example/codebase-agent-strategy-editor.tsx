'use client';

import * as React from 'react';
import { CodebaseAgentStrategyEditor as StrategyEditorComponent } from '@forge/shared/components/assistant-ui';

export function CodebaseAgentStrategyEditorExample() {
  return (
    <div className="h-[640px] min-h-0 w-full">
      <StrategyEditorComponent />
    </div>
  );
}

export const CodebaseAgentStrategyEditor = CodebaseAgentStrategyEditorExample;

export default CodebaseAgentStrategyEditorExample;
