'use client';

/**
 * Consumer Studio workspace: single AI Chat workspace.
 * Exports WORKSPACE_ID and WORKSPACE_LABEL for codegen (app-spec.generated.ts).
 */
import { WorkspaceLayout } from '@forge/dev-kit';

export const WORKSPACE_ID = 'assistant' as const;
export const WORKSPACE_LABEL = 'AI Chat';

/**
 * Layout structure for codegen extraction only.
 * Actual UI is composed in app/page.tsx.
 */
export function ConsumerStudioWorkspaceLayoutSlots() {
  return (
    <WorkspaceLayout.Main>
      <WorkspaceLayout.Panel id="assistant-chat" title="Assistant" />
    </WorkspaceLayout.Main>
  );
}
