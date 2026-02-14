'use client';

import * as React from 'react';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';

export interface TerminalWorkspaceProps {
  commandOutput: string;
  hasActiveRun: boolean;
  onClear: () => void;
  onStop: () => void;
}

export function TerminalWorkspace({
  commandOutput,
  hasActiveRun,
  onClear,
  onStop,
}: TerminalWorkspaceProps) {
  return (
    <div className="h-full min-h-0 p-2">
      <Card className="h-full min-h-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Terminal Output</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={onClear}>
                Clear
              </Button>
              <Button size="sm" variant="destructive" onClick={onStop} disabled={!hasActiveRun}>
                Stop Run
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-3rem)] min-h-0">
          <pre className="h-full max-h-full overflow-auto rounded-md border border-border bg-background p-3 text-xs">
            {commandOutput}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

