'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { useSettingsStore } from '@/lib/settings/store';

export const APP_THEMES = ['dark', 'light'] as const;

type AppTheme = (typeof APP_THEMES)[number];

const isAppTheme = (value: string | undefined): value is AppTheme =>
  (APP_THEMES as readonly string[]).includes(value ?? '');

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.getSettingValue('ui.theme')) as string | undefined;
  const forcedTheme: AppTheme = isAppTheme(theme) ? theme : 'dark';
  const density = useSettingsStore((state) => state.getSettingValue('ui.density')) as string | undefined;

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const nextDensity = density === 'comfortable' ? 'comfortable' : 'compact';
    document.documentElement.dataset.density = nextDensity;
  }, [density]);

  return (
    <ThemeProvider
      attribute="data-theme"
      themes={[...APP_THEMES]}
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme={forcedTheme}
    >
      {children}
    </ThemeProvider>
  );
}
