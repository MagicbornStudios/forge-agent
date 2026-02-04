'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { useSettingsStore } from '@/lib/settings/store';

const APP_THEMES = [
  'dark-fantasy',
  'darcula',
  'cyberpunk',
  'high-contrast',
  'light',
  'girly',
];

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.getSettingValue('ui.theme')) as string | undefined;
  const forcedTheme = APP_THEMES.includes(theme ?? '') ? (theme as string) : 'dark-fantasy';

  return (
    <ThemeProvider
      attribute="data-theme"
      themes={APP_THEMES}
      defaultTheme="dark-fantasy"
      enableSystem={false}
      forcedTheme={forcedTheme}
    >
      {children}
    </ThemeProvider>
  );
}
