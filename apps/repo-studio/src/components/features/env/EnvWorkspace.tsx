'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import type { DependencyHealth } from '@/lib/dependency-health';

export interface EnvWorkspaceProps {
  profile: string;
  mode: 'local' | 'preview' | 'production' | 'headless';
  onProfileChange: (value: string) => void;
  onModeChange: (value: 'local' | 'preview' | 'production' | 'headless') => void;
  envOutput: string;
  dependencyHealth: DependencyHealth | null;
  onRunDoctor: () => void;
  onRunReconcile: () => void;
  onRefreshDeps: () => void;
  onCopyText: (text: string) => void;
}

export function EnvWorkspace({
  profile,
  mode,
  onProfileChange,
  onModeChange,
  envOutput,
  dependencyHealth,
  onRunDoctor,
  onRunReconcile,
  onRefreshDeps,
  onCopyText,
}: EnvWorkspaceProps) {
  const depsOk = dependencyHealth
    ? dependencyHealth.dockviewPackageResolved
      && dependencyHealth.dockviewCssResolved
      && dependencyHealth.sharedStylesResolved
    : null;

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Env Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm md:w-[220px]"
              value={profile}
              onChange={(event) => onProfileChange(event.target.value)}
              placeholder="profile"
            />
            <Select value={mode} onValueChange={(value) => onModeChange(value as typeof mode)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">local</SelectItem>
                <SelectItem value="preview">preview</SelectItem>
                <SelectItem value="production">production</SelectItem>
                <SelectItem value="headless">headless</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={onRunDoctor}>
              Doctor
            </Button>
            <Button size="sm" variant="outline" onClick={onRunReconcile}>
              Reconcile --write --sync-examples
            </Button>
          </div>

          <pre className="max-h-[44vh] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
            {envOutput}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Runtime Dependency Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={depsOk ? 'default' : 'secondary'}>
              {depsOk ? 'healthy' : 'needs attention'}
            </Badge>
            <Button size="sm" variant="outline" onClick={onRefreshDeps}>
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyText('pnpm install\npnpm --filter @forge/repo-studio-app build')}
            >
              Copy Remediation
            </Button>
          </div>

          {dependencyHealth ? (
            <ul className="space-y-1">
              {dependencyHealth.messages.map((message) => (
                <li key={message} className="flex items-start gap-2">
                  {depsOk ? <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-500" /> : <AlertTriangle className="mt-0.5 size-3.5 text-amber-500" />}
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Dependency health has not been checked yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

