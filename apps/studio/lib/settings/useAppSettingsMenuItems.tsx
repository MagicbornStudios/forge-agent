'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Palette, Settings, User } from 'lucide-react';
import type { EditorMenubarItem } from '@forge/shared/components/editor';
import { useSettingsStore } from '@/lib/settings/store';
import { SettingsService } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-client/routes';
import { toast } from 'sonner';
import { APP_THEMES } from '@/components/providers/AppThemeProvider';
import { useMe } from '@/lib/data/hooks';
import { useOpenSettingsSheet } from '@/lib/contexts/OpenSettingsSheetContext';
import { useEditorStore } from '@/lib/app-shell/store';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';

const THEME_LABELS: Record<(typeof APP_THEMES)[number], string> = {
  dark: 'Dark',
  light: 'Light',
};

const DENSITY_OPTIONS = ['compact', 'comfortable'] as const;
const DENSITY_LABELS: Record<(typeof DENSITY_OPTIONS)[number], string> = {
  compact: 'Compact',
  comfortable: 'Comfortable',
};

async function openConnectOnboarding(): Promise<void> {
  const res1 = await fetch(API_ROUTES.STRIPE_CONNECT_CREATE_ACCOUNT, {
    method: 'POST',
    credentials: 'include',
  });
  const data1 = await res1.json();
  if (!res1.ok) throw new Error(data1?.error ?? 'Failed to set up account');
  const res2 = await fetch(API_ROUTES.STRIPE_CONNECT_ONBOARDING_LINK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
    }),
  });
  const data2 = await res2.json();
  if (!res2.ok) throw new Error(data2?.error ?? 'Failed to get onboarding link');
  if (data2?.url) window.location.href = data2.url;
}

function getDisplayName(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) return name.trim();
  if (email?.trim()) return email.trim();
  return 'User';
}

export function useAppSettingsMenuItems(options: { onOpenCreateListing: () => void }): EditorMenubarItem[] {
  const openAppSettingsSheet = useOpenSettingsSheet();
  const settingsSidebarOpen = useEditorStore((s) => s.settingsSidebarOpen);
  const appSettingsSheetOpen = useEditorStore((s) => s.appSettingsSheetOpen);
  const theme = useSettingsStore((s) => s.getSettingValue('ui.theme')) as string | undefined;
  const density = useSettingsStore((s) => s.getSettingValue('ui.density')) as string | undefined;
  const setSetting = useSettingsStore((s) => s.setSetting);
  const getOverridesForScope = useSettingsStore((s) => s.getOverridesForScope);
  const { data, isLoading } = useMe();
  const user = data?.user ?? null;
  const entitlements = useEntitlements();
  const hasPlatformList = entitlements.has(CAPABILITIES.PLATFORM_LIST);
  const [connectLoading, setConnectLoading] = useState(false);

  const currentTheme = APP_THEMES.includes(theme as (typeof APP_THEMES)[number])
    ? (theme as (typeof APP_THEMES)[number])
    : 'dark';
  const currentDensity = DENSITY_OPTIONS.includes(density as (typeof DENSITY_OPTIONS)[number])
    ? (density as (typeof DENSITY_OPTIONS)[number])
    : 'compact';
  const displayName = user ? getDisplayName(user.name, user.email) : null;

  const persistSettings = useCallback(async () => {
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

  const handleThemeSelect = useCallback(
    async (value: (typeof APP_THEMES)[number]) => {
      setSetting('app', 'ui.theme', value);
      await persistSettings();
    },
    [setSetting, persistSettings],
  );

  const handleDensitySelect = useCallback(
    async (value: (typeof DENSITY_OPTIONS)[number]) => {
      setSetting('app', 'ui.density', value);
      await persistSettings();
    },
    [setSetting, persistSettings],
  );

  const handleConnectOnboarding = useCallback(async () => {
    setConnectLoading(true);
    try {
      await openConnectOnboarding();
    } finally {
      setConnectLoading(false);
    }
  }, []);

  const handleSettingsMenuToggle = useCallback(() => {
    const state = useEditorStore.getState();
    if (state.settingsSidebarOpen || state.appSettingsSheetOpen) {
      state.setSettingsSidebarOpen(false);
      state.setAppSettingsSheetOpen(false);
      return;
    }
    openAppSettingsSheet();
  }, [openAppSettingsSheet]);

  return useMemo(() => {
    const items: EditorMenubarItem[] = [];

    APP_THEMES.forEach((t) => {
      items.push({
        id: `theme-${t}`,
        label: t === currentTheme ? `${THEME_LABELS[t]} (Current)` : THEME_LABELS[t],
        icon: <Palette className="size-3" />,
        onSelect: () => handleThemeSelect(t),
      });
    });
    items.push({ id: 'sep-theme-density', type: 'separator' });

    DENSITY_OPTIONS.forEach((d) => {
      items.push({
        id: `density-${d}`,
        label: d === currentDensity ? `${DENSITY_LABELS[d]} (Current)` : DENSITY_LABELS[d],
        onSelect: () => handleDensitySelect(d),
      });
    });
    items.push({ id: 'sep-density-user', type: 'separator' });

    if (isLoading) {
      items.push({
        id: 'user-loading',
        label: 'Loading...',
        icon: <User className="size-3" />,
        disabled: true,
      });
    } else if (!user) {
      items.push({
        id: 'user-signed-out',
        label: 'Not signed in',
        icon: <User className="size-3" />,
        disabled: true,
      });
    } else {
      items.push({
        id: 'user-signed-in',
        label: `Signed in as ${displayName}`,
        icon: <User className="size-3" />,
        disabled: true,
      });
      if (hasPlatformList) {
        if (!user.stripeConnectAccountId) {
          items.push({
            id: 'payouts',
            label: connectLoading ? 'Opening...' : 'Set up payouts',
            onSelect: handleConnectOnboarding,
            disabled: connectLoading,
          });
        }
        items.push({
          id: 'list-in-catalog',
          label: 'List in catalog',
          onSelect: options.onOpenCreateListing,
        });
      }
    }
    items.push({ id: 'sep-user-open', type: 'separator' });
    items.push({
      id: settingsSidebarOpen || appSettingsSheetOpen ? 'close-settings' : 'open-settings',
      label: settingsSidebarOpen || appSettingsSheetOpen ? 'Close Settings' : 'Open Settings',
      icon: <Settings className="size-3" />,
      onSelect: handleSettingsMenuToggle,
    });

    return items;
  }, [
    currentTheme,
    currentDensity,
    isLoading,
    user,
    displayName,
    hasPlatformList,
    connectLoading,
    handleThemeSelect,
    handleDensitySelect,
    handleConnectOnboarding,
    options.onOpenCreateListing,
    settingsSidebarOpen,
    appSettingsSheetOpen,
    handleSettingsMenuToggle,
  ]);
}
