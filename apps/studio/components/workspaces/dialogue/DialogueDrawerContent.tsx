'use client';

import React from 'react';
import { EditorBottomPanel } from '@forge/shared';

export interface DialogueDrawerContentProps {
  workflowPanel?: React.ReactNode;
}

/** CopilotKit tab removed; Workflow tab only. */
export function DialogueDrawerContent({ workflowPanel }: DialogueDrawerContentProps) {
  return (
    <EditorBottomPanel>
      <div className="flex flex-col h-full min-h-0 p-[var(--panel-padding)]">
        {workflowPanel ?? (
          <div className="text-xs text-muted-foreground">
            Workflow panel is not available in this editor.
          </div>
        )}
      </div>
    </EditorBottomPanel>
  );
}
