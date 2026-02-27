'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import type { PlanningSnapshot } from '@/lib/repo-data';

export interface RegressionPanelProps {
  planning: PlanningSnapshot;
}

export function RegressionPanel({
  planning,
}: RegressionPanelProps) {
  const hasRisk = planning.errorOpen > 0;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={hasRisk ? 'destructive' : 'secondary'} className="font-normal">
          {planning.errorOpen} open error checklist items
        </Badge>
        <Badge variant="outline" className="font-normal">
          {planning.verifications} verifications
        </Badge>
        <Badge variant="outline" className="font-normal">
          {planning.summaries} summaries
        </Badge>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3 text-xs whitespace-pre-wrap">
        {String(planning.errorsContent || '') || 'No regression/error notes available.'}
      </pre>
    </div>
  );
}
