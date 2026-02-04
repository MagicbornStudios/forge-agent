import React from 'react';

export interface ConfirmationCardProps {
  title: string;
  description: string;
  status: string;
  result?: { success: boolean; message: string };
}

/**
 * Standard confirmation card rendered in the CopilotKit chat
 * when an AI action completes a destructive operation.
 *
 * Used with the `render` prop on `useCopilotAction`.
 */
export function ConfirmationCard({ title, description, status, result }: ConfirmationCardProps) {
  if (status === 'complete' && result) {
    return (
      <div className="rounded-md border p-3 text-sm">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1">{result.message}</p>
      </div>
    );
  }

  if (status === 'inProgress') {
    return (
      <div className="rounded-md border p-3 text-sm animate-pulse">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3 text-sm">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
