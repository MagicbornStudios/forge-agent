'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function ThemeSwitcherDemo() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  return (
    <ShowcaseDemoSurface>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UI.Badge variant="outline">Theme</UI.Badge>
          <UI.Button
            size="sm"
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
          >
            Light
          </UI.Button>
          <UI.Button
            size="sm"
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
          >
            Dark
          </UI.Button>
        </div>
        <p className="text-xs text-muted-foreground">Selected theme: {theme}</p>
      </div>
    </ShowcaseDemoSurface>
  );
}
