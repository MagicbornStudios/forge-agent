'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { EditorButton } from '@forge/shared/components/editor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@forge/ui/dropdown-menu';
import { useSettingsStore } from '@/lib/settings/store';
import { SettingsService } from '@/lib/api-client';
import { toast } from 'sonner';
import { APP_THEMES } from '@/components/providers/AppThemeProvider';

const THEME_LABELS: Record<(typeof APP_THEMES)[number], string> = {
  'dark-fantasy': 'Dark Fantasy',
  darcula: 'Darcula',
  cyberpunk: 'Cyberpunk',
  'high-contrast': 'High Contrast',
  light: 'Light',
  girly: 'Girly',
};

const DENSITY_OPTIONS = ['compact', 'comfortable'] as const;
const DENSITY_LABELS: Record<(typeof DENSITY_OPTIONS)[number], string> = {
  compact: 'Compact',
  comfortable: 'Comfortable',
};

export function ThemeSwitcher() {
  const theme = useSettingsStore((s) => s.getSettingValue('ui.theme')) as string | undefined;
  const density = useSettingsStore((s) => s.getSettingValue('ui.density')) as string | undefined;
  const setSetting = useSettingsStore((s) => s.setSetting);
  const getOverridesForScope = useSettingsStore((s) => s.getOverridesForScope);
  const currentTheme = APP_THEMES.includes(theme as (typeof APP_THEMES)[number])
    ? (theme as (typeof APP_THEMES)[number])
    : 'dark-fantasy';
  const currentDensity = DENSITY_OPTIONS.includes(density as (typeof DENSITY_OPTIONS)[number])
    ? (density as (typeof DENSITY_OPTIONS)[number])
    : 'compact';

  const persistSettings = React.useCallback(async () => {
    try {
      await SettingsService.postApiSettings({
        scope: 'app',
        scopeId: null,
        settings: getOverridesForScope('app'),
      });
      toast.success('Settings saved', { description: 'Theme and density will persist after refresh.' });
    } catch (e) {
      toast.error('Failed to save settings', {
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }, [getOverridesForScope]);

  const handleThemeSelect = React.useCallback(
    async (value: (typeof APP_THEMES)[number]) => {
      setSetting('app', 'ui.theme', value);
      await persistSettings();
    },
    [setSetting, persistSettings],
  );

  const handleDensitySelect = React.useCallback(
    async (value: (typeof DENSITY_OPTIONS)[number]) => {
      setSetting('app', 'ui.density', value);
      await persistSettings();
    },
    [setSetting, persistSettings],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EditorButton variant="ghost" size="sm" tooltip="Change theme and density">
          <Palette className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Theme</span>
        </EditorButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {APP_THEMES.map((t) => (
          <DropdownMenuItem
            key={t}
            onSelect={() => handleThemeSelect(t)}
            className={currentTheme === t ? 'bg-accent text-xs' : 'text-xs'}
          >
            {THEME_LABELS[t]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {DENSITY_OPTIONS.map((d) => (
          <DropdownMenuItem
            key={d}
            onSelect={() => handleDensitySelect(d)}
            className={currentDensity === d ? 'bg-accent text-xs' : 'text-xs'}
          >
            {DENSITY_LABELS[d]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
