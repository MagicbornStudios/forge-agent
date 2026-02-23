'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { Textarea } from '@forge/ui/textarea';
import { REPO_SETTINGS_SECTIONS } from '@/lib/settings/registry';
import { PlatformConnectionCard } from '@/components/features/settings/PlatformConnectionCard';
import { useRepoSettings } from './RepoSettingsProvider';

export function RepoSettingsRegistrations() {
  const settings = useRepoSettings();

  return (
    <div className="space-y-3 px-2 pb-3 text-xs">
      {REPO_SETTINGS_SECTIONS.map((section) => (
        <Card key={section.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.fields.map((field) => {
              const value = settings.getFieldValue(field.key);
              if (field.type === 'toggle') {
                const derived = field.key === 'reviewQueue.autoApplyEnabled';
                return (
                  <label key={field.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={value === true}
                      disabled={derived}
                      onChange={(event) => settings.setFieldValue(field.key, event.target.checked)}
                    />
                    {field.label}
                  </label>
                );
              }

              if (field.type === 'select' && field.options) {
                return (
                  <label key={field.key} className="block space-y-1">
                    <span className="text-muted-foreground">{field.label}</span>
                    <Select value={String(value || '')} onValueChange={(next) => settings.setFieldValue(field.key, next)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <label key={field.key} className="block space-y-1">
                    <span className="text-muted-foreground">{field.label}</span>
                    <Textarea
                      value={String(value || '')}
                      className="min-h-24 font-mono text-xs"
                      onChange={(event) => settings.setFieldValue(field.key, event.target.value)}
                    />
                    {field.description ? <p className="text-[10px] text-muted-foreground">{field.description}</p> : null}
                  </label>
                );
              }

              return (
                <label key={field.key} className="block space-y-1">
                  <span className="text-muted-foreground">{field.label}</span>
                  <Input
                    value={String(value || '')}
                    readOnly={field.key === 'reviewQueue.lastAutoApplyAt'}
                    onChange={(event) => settings.setFieldValue(field.key, event.target.value)}
                  />
                  {field.description ? <p className="text-[10px] text-muted-foreground">{field.description}</p> : null}
                </label>
              );
            })}

            <Button size="sm" variant="destructive" onClick={settings.onStopRuntime}>
              Stop RepoStudio Runtime
            </Button>
          </CardContent>
        </Card>
      ))}

      <PlatformConnectionCard />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Panels</CardTitle>
            <Button size="sm" variant="ghost" onClick={settings.onRestorePanels}>
              Restore All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {settings.panelSpecs.map((panel) => {
            const visible = settings.panelVisibility[panel.key] !== false;
            return (
              <div key={panel.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{panel.label}</div>
                  <div className="text-[10px] text-muted-foreground">{panel.rail}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={visible ? 'outline' : 'secondary'}>{visible ? 'visible' : 'hidden'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => settings.onSetPanelVisible(panel.id, !visible)}>
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
