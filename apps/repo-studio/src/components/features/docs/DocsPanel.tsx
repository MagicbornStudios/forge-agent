'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';

export function DocsPanel() {
  return (
    <div className="h-full min-h-0 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Runbooks + Contracts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <p>Primary package docs:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><code>packages/forge-loop/docs/01-quickstart.md</code></li>
            <li><code>packages/forge-loop/docs/03-agent-loop.md</code></li>
            <li><code>packages/forge-env/docs/01-quickstart.md</code></li>
            <li><code>packages/repo-studio/docs/01-quickstart.md</code></li>
          </ul>
          <p className="pt-2">
            Use the Planning panel to inspect `.planning` artifacts and attach exact docs into Assistant context.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


