'use client';

import React from 'react';
import { LivePlayerProvider } from '@twick/live-player';
import { TimelineProvider, INITIAL_TIMELINE_DATA } from '@twick/timeline';
import { CopilotKitBypassProvider } from '@/components/providers/CopilotKitBypassProvider';
import { LocalDevAuthGate } from '@/components/providers/LocalDevAuthGate';
import { AppProviders as SharedAppProviders } from '@forge/shared/components/app';
import { EntitlementsProvider } from '@/components/providers/EntitlementsProvider';
import { AppShellPersistGate } from '@/components/persistence/AppShellPersistGate';
import { DirtyBeforeUnload } from '@/components/persistence/DirtyBeforeUnload';
import { OpenSettingsSheetProvider } from '@/lib/contexts/OpenSettingsSheetContext';
import { StudioMenubarProvider } from '@/lib/contexts/AppMenubarContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  useSidebar,
} from '@forge/ui/sidebar';
import { Button } from '@forge/ui/button';
import { AppSettingsPanelContent } from '@/components/settings/AppSettingsPanelContent';
import { SETTINGS_SCOPE_COLORS } from '@/lib/app-shell/editor-metadata';
import { useAppShellStore } from '@/lib/app-shell/store';
import { cn } from '@forge/shared/lib/utils';
import { X } from 'lucide-react';

function capitalizeTab(tab: string): string {
  return tab.charAt(0).toUpperCase() + tab.slice(1);
}

export interface AppProvidersProps {
  children: React.ReactNode;
  copilotDefaultOpen?: boolean;
}

function MainWithSettingsMargin({ children }: { children: React.ReactNode }) {
  const { open, state } = useSidebar();
  const showMargin = open && state === 'expanded';
  return (
    <div
      className={cn(
        'flex flex-1 flex-col min-h-0 min-w-0 transition-[margin] duration-200 ease-linear',
        showMargin && 'md:mr-[var(--sidebar-width)]'
      )}
    >
      {children}
    </div>
  );
}

/** CopilotKit removed; BypassProvider supplies CopilotSidebarContext for legacy useCopilotSidebar consumers (e.g. devtools). */
export function AppProviders({ children }: AppProvidersProps) {
  const settingsSidebarOpen = useAppShellStore((s) => s.settingsSidebarOpen);
  const setSettingsSidebarOpen = useAppShellStore((s) => s.setSettingsSidebarOpen);
  const requestOpenSettings = useAppShellStore((s) => s.requestOpenSettings);
  const setRequestOpenSettings = useAppShellStore((s) => s.setRequestOpenSettings);
  const activeWorkspaceId = useAppShellStore((s) => s.route.activeWorkspaceId);
  const activeProjectId = useAppShellStore((s) => s.activeProjectId);
  const settingsViewportId = useAppShellStore((s) => s.settingsViewportId);
  const settingsActiveTab = useAppShellStore((s) => s.settingsActiveTab);

  React.useEffect(() => {
    if (!requestOpenSettings) return;
    setSettingsSidebarOpen(true);
    setRequestOpenSettings(false);
  }, [requestOpenSettings, setSettingsSidebarOpen, setRequestOpenSettings]);

  React.useEffect(() => {
    if (!settingsSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSettingsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [settingsSidebarOpen, setSettingsSidebarOpen]);

  return (
    <AppShellPersistGate>
      <DirtyBeforeUnload />
      <LocalDevAuthGate>
        <EntitlementsProvider>
          <LivePlayerProvider>
            <TimelineProvider
              contextId="studio-video"
              initialData={INITIAL_TIMELINE_DATA}
              undoRedoPersistenceKey="studio-video-history"
            >
              <SharedAppProviders>
                <CopilotKitBypassProvider>
                  <OpenSettingsSheetProvider>
                    <StudioMenubarProvider>
                      <SidebarProvider
                        open={settingsSidebarOpen}
                        onOpenChange={setSettingsSidebarOpen}
                        className="flex flex-col h-screen min-h-0 w-full"
                        style={
                          {
                            '--sidebar-width': '20rem',
                            '--sidebar-width-mobile': '18rem',
                          } as React.CSSProperties
                        }
                      >
                        <MainWithSettingsMargin>{children}</MainWithSettingsMargin>
                        <Sidebar
                          side="right"
                          collapsible="offcanvas"
                          className="border-l border-sidebar-border"
                        >
                          <SidebarHeader
                            className="border-b border-sidebar-border p-[var(--panel-padding)]"
                            style={
                              settingsActiveTab &&
                              SETTINGS_SCOPE_COLORS[settingsActiveTab]
                                ? {
                                    borderLeftWidth: 4,
                                    borderLeftStyle: 'solid',
                                    borderLeftColor:
                                      SETTINGS_SCOPE_COLORS[settingsActiveTab],
                                  }
                                : undefined
                            }
                          >
                            <div className="flex items-start justify-between gap-[var(--control-gap)]">
                              <div>
                                <h2 className="text-sm font-semibold text-sidebar-foreground">
                                  {settingsActiveTab
                                    ? `Settings - ${capitalizeTab(settingsActiveTab)}`
                                    : 'Settings'}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  App and workspace defaults; viewport settings when in context.
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Close settings"
                                className="h-[var(--control-height-sm)] w-[var(--control-height-sm)] shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={() => setSettingsSidebarOpen(false)}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          </SidebarHeader>
                          <SidebarContent className="flex-1 min-h-0">
                            <AppSettingsPanelContent
                              activeWorkspaceId={activeWorkspaceId}
                              activeProjectId={
                                activeProjectId != null ? String(activeProjectId) : null
                              }
                              viewportId={settingsViewportId ?? 'main'}
                              className="h-full"
                            />
                          </SidebarContent>
                        </Sidebar>
                      </SidebarProvider>
                    </StudioMenubarProvider>
                  </OpenSettingsSheetProvider>
                </CopilotKitBypassProvider>
              </SharedAppProviders>
            </TimelineProvider>
          </LivePlayerProvider>
        </EntitlementsProvider>
      </LocalDevAuthGate>
    </AppShellPersistGate>
  );
}
