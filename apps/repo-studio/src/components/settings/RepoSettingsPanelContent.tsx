'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import type { RepoEditorPanelSpec } from '@/lib/app-shell/editor-panels';

export interface RepoSettingsPanelContentProps {
  profile: string;
  mode: 'local' | 'preview' | 'production' | 'headless';
  confirmRuns: boolean;
  panelSpecs: RepoEditorPanelSpec[];
  panelVisibility: Record<string, boolean>;
  onProfileChange: (value: string) => void;
  onModeChange: (value: 'local' | 'preview' | 'production' | 'headless') => void;
  onConfirmRunsChange: (value: boolean) => void;
  onSetPanelVisible: (panelId: string, visible: boolean) => void;
  onRestorePanels: () => void;
  onStopRuntime: () => void;
}

export function RepoSettingsPanelContent({
  profile,
  mode,
  confirmRuns,
  panelSpecs,
  panelVisibility,
  onProfileChange,
  onModeChange,
  onConfirmRunsChange,
  onSetPanelVisible,
  onRestorePanels,
  onStopRuntime,
}: RepoSettingsPanelContentProps) {
  return (
    <div className="space-y-3 px-2 pb-3 text-xs">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Runtime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="block space-y-1">
            <span className="text-muted-foreground">Profile</span>
            <Input value={profile} onChange={(event) => onProfileChange(event.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-muted-foreground">Mode</span>
            <Select value={mode} onValueChange={(value) => onModeChange(value as typeof mode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">local</SelectItem>
                <SelectItem value="preview">preview</SelectItem>
                <SelectItem value="production">production</SelectItem>
                <SelectItem value="headless">headless</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={confirmRuns}
              onChange={(event) => onConfirmRunsChange(event.target.checked)}
            />
            confirm command runs
          </label>
          <Button size="sm" variant="destructive" onClick={onStopRuntime}>
            Stop RepoStudio Runtime
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Panels</CardTitle>
            <Button size="sm" variant="ghost" onClick={onRestorePanels}>
              Restore All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {panelSpecs.map((panel) => {
            const visible = panelVisibility[panel.key] !== false;
            return (
              <div key={panel.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{panel.label}</div>
                  <div className="text-[10px] text-muted-foreground">{panel.rail}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={visible ? 'outline' : 'secondary'}>{visible ? 'visible' : 'hidden'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => onSetPanelVisible(panel.id, !visible)}>
                    {visible ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

