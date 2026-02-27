'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import type { PlanningSnapshot } from '@/lib/repo-data';

export interface StatusPanelProps {
  planning: PlanningSnapshot;
}

export function StatusPanel({
  planning,
}: StatusPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-normal">{planning.percent}% complete</Badge>
        <Badge variant="outline" className="font-normal">{planning.rows.length} phases</Badge>
        <Badge variant="outline" className="font-normal">{planning.openTaskCount} open tasks</Badge>
        <Badge variant="outline" className="font-normal">{planning.completeTaskCount} complete tasks</Badge>
      </div>
      <div className="rounded-md border border-border p-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Next Action</p>
        <p className="mt-1 whitespace-pre-wrap">{planning.nextAction || '-'}</p>
      </div>
      <div className="rounded-md border border-border p-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Planning Root</p>
        <p className="mt-1 font-mono">{planning.planningRoot}</p>
      </div>
    </div>
  );
}
