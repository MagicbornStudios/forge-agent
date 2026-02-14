'use client';

import * as React from 'react';
import { PanelSettings, SettingsTabs } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function SettingsSystemDemo() {
  const [dense, setDense] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('general');

  return (
    <ShowcaseDemoSurface>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Density: {dense ? 'compact' : 'comfortable'}</span>
          <PanelSettings
            panelId="settings-system-demo"
            settings={[
              {
                id: 'density',
                label: 'Compact density',
                type: 'toggle',
                value: dense,
                onChange: (value) => setDense(Boolean(value)),
              },
            ]}
          />
        </div>
        <div className="h-[180px] rounded-md border border-border/70 p-3">
          <SettingsTabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              {
                id: 'general',
                label: 'General',
                content: <div className="text-xs text-muted-foreground">General settings</div>,
              },
              {
                id: 'appearance',
                label: 'Appearance',
                content: <div className="text-xs text-muted-foreground">Appearance settings</div>,
              },
            ]}
          />
        </div>
      </div>
    </ShowcaseDemoSurface>
  );
}
