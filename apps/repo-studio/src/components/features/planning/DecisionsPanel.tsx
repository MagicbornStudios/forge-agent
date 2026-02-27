'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import type { PlanningSnapshot } from '@/lib/repo-data';

export interface DecisionsPanelProps {
  planning: PlanningSnapshot;
  onCopyText: (text: string) => void;
}

export function DecisionsPanel({
  planning,
  onCopyText,
}: DecisionsPanelProps) {
  const content = String(planning.decisionsContent || '');

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={planning.decisionOpen > 0 ? 'destructive' : 'secondary'} className="font-normal">
          {planning.decisionOpen} open decision items
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopyText(content)}
          disabled={!content}
        >
          Copy
        </Button>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3 text-xs whitespace-pre-wrap">
        {content || 'No decisions content available.'}
      </pre>
    </div>
  );
}
