'use client';

import * as React from 'react';
import { Button } from '@forge/ui/button';

export interface LoopCadencePanelProps {
  nextAction: string;
  onCopyText: (text: string) => void;
  onRefresh: () => void;
}

export function LoopCadencePanel({
  nextAction,
  onCopyText,
  onRefresh,
}: LoopCadencePanelProps) {
  return (
    <div className="space-y-3 p-2 text-xs">
      <p className="text-muted-foreground">Nonstop Ralph loop:</p>
      <ol className="list-decimal space-y-1 pl-4">
        <li><code>forge-loop progress</code></li>
        <li><code>forge-loop discuss-phase &lt;phase&gt;</code></li>
        <li><code>forge-loop plan-phase &lt;phase&gt;</code></li>
        <li><code>forge-loop execute-phase &lt;phase&gt;</code></li>
        <li><code>forge-loop verify-work &lt;phase&gt; --strict</code></li>
        <li><code>forge-loop sync-legacy</code></li>
      </ol>
      <div className="rounded-md border border-border bg-background p-2">
        <div className="text-[11px] uppercase text-muted-foreground">Next action</div>
        <code className="mt-1 block whitespace-normal break-all">{nextAction}</code>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onCopyText(nextAction)}>
          Copy Next Action
        </Button>
        <Button size="sm" variant="outline" onClick={onRefresh}>
          Refresh Snapshot
        </Button>
      </div>
    </div>
  );
}

