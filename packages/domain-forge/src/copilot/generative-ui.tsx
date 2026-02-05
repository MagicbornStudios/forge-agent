import React from 'react';
import type { CopilotActionRenderProps } from '@forge/shared/copilot/types';
import { ConfirmationCard } from '@forge/shared/copilot/generative-ui';

/** Render function for forge_createNode -- shows what was created in chat. */
export function renderNodeCreated({ args, status, result }: CopilotActionRenderProps) {
  if (status === 'complete' && result?.success) {
    return (
      <div className="rounded-md border p-3 bg-muted/50">
        <p className="text-sm font-medium">Created: {String(args.label ?? 'Node')}</p>
        <p className="text-xs text-muted-foreground">Type: {String(args.nodeType ?? 'Unknown')}</p>
      </div>
    );
  }
  if (status === 'inProgress') {
    return (
      <div className="rounded-md border p-3 bg-muted/50 animate-pulse">
        <p className="text-sm text-muted-foreground">Creating node...</p>
      </div>
    );
  }
  return <></>;
}

/** Render function for forge_deleteNode -- shows confirmation in chat. */
export function renderDeleteNodeResult({ args, status, result }: CopilotActionRenderProps) {
  return (
    <ConfirmationCard
      title="Delete Node"
      description={`Deleting node "${String(args.nodeId)}" and its connected edges.`}
      status={status}
      result={result as { success: boolean; message: string } | undefined}
    />
  );
}

/** Render function for forge_updateNode -- shows what was changed in chat. */
export function renderNodeUpdated({ args, status, result }: CopilotActionRenderProps) {
  if (status === 'complete' && result?.success) {
    const fields = Object.entries(args)
      .filter(([k]) => k !== 'nodeId' && args[k] !== undefined)
      .map(([k, v]) => `${k}: ${String(v)}`);
    return (
      <div className="rounded-md border p-3 bg-muted/50">
        <p className="text-sm font-medium">Updated: {String(args.nodeId)}</p>
        {fields.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{fields.join(', ')}</p>
        )}
      </div>
    );
  }
  if (status === 'inProgress') {
    return (
      <div className="rounded-md border p-3 bg-muted/50 animate-pulse">
        <p className="text-sm text-muted-foreground">Updating node...</p>
      </div>
    );
  }
  return <></>;
}
