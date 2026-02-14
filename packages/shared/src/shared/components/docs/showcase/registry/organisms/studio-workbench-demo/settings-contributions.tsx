'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import type { SettingsTabDef } from '@forge/shared';
import type { DemoEditorId } from './types';

export function buildSettingsContribution(editorId: DemoEditorId): SettingsTabDef[] {
  if (editorId === 'dialogue') {
    return [
      {
        id: 'general',
        label: 'General',
        content: (
          <div className="space-y-3">
            <label className="block space-y-1 text-xs">
              <span className="text-muted-foreground">Scene title</span>
              <UI.Input defaultValue="Market Square Confrontation" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2 text-xs">
              Auto-save drafts
              <UI.Switch defaultChecked />
            </label>
          </div>
        ),
      },
      {
        id: 'flow',
        label: 'Flow',
        content: (
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Dialogue editor contribution</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Auto insert reaction beats</li>
              <li>Speaker continuity warnings</li>
              <li>Conflict pacing hints</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'assistant',
        label: 'Assistant',
        content: (
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Model routing: Narrative + Critique</p>
            <p>
              Prompt template: <span className="font-medium text-foreground">dialogue/default.v2</span>
            </p>
          </div>
        ),
      },
    ];
  }

  return [
    {
      id: 'general',
      label: 'General',
      content: (
        <div className="space-y-3">
          <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">Character name</span>
            <UI.Input defaultValue="Captain Vale" />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2 text-xs">
            Enforce voice consistency
            <UI.Switch defaultChecked />
          </label>
        </div>
      ),
    },
    {
      id: 'biography',
      label: 'Biography',
      content: (
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Character editor contribution</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Origin: Northern Archipelago</li>
            <li>Primary arc: Redemption</li>
            <li>Forbidden topic list enabled</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'voice',
      label: 'Voice',
      content: (
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Tone profile: dry / strategic / clipped</p>
          <p>Reading level target: grade 8</p>
        </div>
      ),
    },
  ];
}

