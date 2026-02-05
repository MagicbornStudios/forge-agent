'use client';

import React from 'react';

interface StructuredOutputRenderProps {
  status: string;
  args: Record<string, unknown>;
  result?: { success: boolean; message?: string; data?: unknown };
}

/** Renders structured JSON result in chat when app_respondWithStructure completes. */
export function StructuredOutputRender({ status, args, result }: StructuredOutputRenderProps) {
  const data = result?.data;

  if (status === 'complete' && data !== undefined) {
    return (
      <div className="rounded-md border p-3 bg-muted/50 space-y-2">
        <p className="text-sm font-medium">Structured result</p>
        <pre className="text-xs overflow-auto max-h-60 p-2 rounded bg-background border">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }
  if (status === 'inProgress') {
    return (
      <div className="rounded-md border p-3 bg-muted/50 animate-pulse">
        <p className="text-sm text-muted-foreground">Extracting structured data...</p>
      </div>
    );
  }
  if (status === 'complete' && result && !result.success) {
    return (
      <div className="rounded-md border p-3 bg-destructive/10">
        <p className="text-sm text-destructive">{result.message ?? 'Structured output failed'}</p>
      </div>
    );
  }
  // CopilotKit action render must return a ReactElement (no null).
  return <></>;
}
