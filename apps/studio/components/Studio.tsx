'use client';

import React, { useMemo } from 'react';
import { useProjects, useCreateProject } from '@/lib/data/hooks';
import { ProjectSwitcher } from '@/components/ProjectSwitcher';
import { StudioApp } from '@forge/shared/components/app';
import {
  EditorButton,
  EditorMenubar,
  EditorFileMenu,
  EditorHelpMenu,
} from '@forge/shared/components/editor';
import { AppSettingsSheet } from '@/components/settings/AppSettingsSheet';
import { CreateListingSheet } from '@/components/listings/CreateListingSheet';
import { OpenSettingsSheetProvider } from '@/lib/contexts/OpenSettingsSheetContext';
import { StudioMenubarProvider } from '@/lib/contexts/AppMenubarContext';
import { useAppSettingsMenuItems } from '@/lib/settings/useAppSettingsMenuItems';
import { Toaster } from '@forge/ui/sonner';
import { Separator } from '@forge/ui/separator';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from '@forge/ui/sidebar';
import { AppSettingsPanelContent } from '@/components/settings/AppSettingsPanelContent';
import { AppSettingsProvider } from '@/components/settings/AppSettingsProvider';
import { useSettingsStore } from '@/lib/settings/store';
import { useEditorRegistryStore } from '@/lib/editor-registry/editor-registry';
import { useMenuRegistry } from '@/lib/editor-registry/menu-registry';
import { useEditorStore } from '@/lib/app-shell/store';
import { MessageCircle, Settings, Users } from 'lucide-react';
import { cn } from '@forge/shared/lib/utils';

const STUDIO_MENUBAR_TARGET = 'studio-menubar';

function UnifiedMenubar({
  onOpenCreateListing,
  openProjectSwitcher,
  mergeEditorMenus = true,
}: {
  onOpenCreateListing: () => void;
  openProjectSwitcher?: () => void;
  mergeEditorMenus?: boolean;
}) {
  const activeWorkspaceId = useEditorStore((s) => s.route.activeWorkspaceId);
  const editorMenus = useMenuRegistry(
    mergeEditorMenus ? STUDIO_MENUBAR_TARGET : undefined,
    mergeEditorMenus ? activeWorkspaceId : null
  );
  const appSettingsItems = useAppSettingsMenuItems({ onOpenCreateListing });
  const merged = useMemo(() => {
    const helpItems = [EditorHelpMenu.Welcome(), EditorHelpMenu.About()];
    if (!mergeEditorMenus) {
      const fileItems = [
        ...(openProjectSwitcher ? [EditorFileMenu.SwitchProject({ onSelect: openProjectSwitcher })] : []),
      ];
      return [
        ...(fileItems.length > 0 ? [{ id: 'file', label: 'File', items: fileItems }] : []),
        { id: 'settings', label: 'Settings', items: appSettingsItems },
        { id: 'help', label: 'Help', items: helpItems },
      ];
    }
    const fileMenuFromEditor = editorMenus.find((m) => m.id === 'file');
    const otherEditorMenus = editorMenus.filter((m) => m.id !== 'file');
    const fileItems = [
      ...(openProjectSwitcher ? [EditorFileMenu.SwitchProject({ onSelect: openProjectSwitcher })] : []),
      ...(fileMenuFromEditor?.items ?? []),
    ];
    return [
      ...(fileItems.length > 0 ? [{ id: 'file', label: 'File', items: fileItems }] : []),
      ...otherEditorMenus,
      { id: 'settings', label: 'Settings', items: appSettingsItems },
      { id: 'help', label: 'Help', items: helpItems },
    ];
  }, [mergeEditorMenus, editorMenus, appSettingsItems, openProjectSwitcher]);
  return <EditorMenubar menus={merged} />;
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

function ActiveEditorContent({ activeWorkspaceId }: { activeWorkspaceId: string }) {
  const descriptor = useEditorRegistryStore((s) => s.editors[activeWorkspaceId]);
  const Component = descriptor?.component;
  if (!Component) return null;
  return <Component />;
}

/**
 * Studio root: all providers (Sidebar, Menubar, Settings, OpenSettingsSheet) and layout.
 * The host renders <Studio />; Studio owns the chrome and editor content from the registry.
 */
export function Studio() {
  const {
    route,
    activeProjectId,
    setActiveProjectId,
    setActiveWorkspace,
    openWorkspace,
    closeWorkspace,
  } = useEditorStore();
  const appSettingsSheetOpen = useEditorStore((s) => s.appSettingsSheetOpen);
  const setAppSettingsSheetOpen = useEditorStore((s) => s.setAppSettingsSheetOpen);
  const settingsSidebarOpen = useEditorStore((s) => s.settingsSidebarOpen);
  const setSettingsSidebarOpen = useEditorStore((s) => s.setSettingsSidebarOpen);
  const settingsViewportId = useEditorStore((s) => s.settingsViewportId);
  const requestOpenSettings = useEditorStore((s) => s.requestOpenSettings);
  const setRequestOpenSettings = useEditorStore((s) => s.setRequestOpenSettings);
  const { activeWorkspaceId, openWorkspaceIds } = route;

  React.useEffect(() => {
    if (!requestOpenSettings) return;
    setSettingsSidebarOpen(true);
    setRequestOpenSettings(false);
  }, [requestOpenSettings, setSettingsSidebarOpen, setRequestOpenSettings]);

  const [projectSwitcherOpen, setProjectSwitcherOpen] = React.useState(false);
  const [createListingOpen, setCreateListingOpen] = React.useState(false);
  const projectsQuery = useProjects();
  const createProjectMutation = useCreateProject();

  React.useEffect(() => {
    if (activeProjectId != null) return;
    const projects = projectsQuery.data ?? [];
    if (projects.length > 0) setActiveProjectId(projects[0].id);
  }, [activeProjectId, projectsQuery.data, setActiveProjectId]);

  const toastsEnabled = useSettingsStore((s) => s.getSettingValue('ui.toastsEnabled')) as boolean | undefined;
  const visibleWorkspaceIds = openWorkspaceIds;

  return (
    <OpenSettingsSheetProvider>
      <StudioMenubarProvider>
        <SidebarProvider
          open={settingsSidebarOpen}
          onOpenChange={setSettingsSidebarOpen}
          className="flex flex-col h-screen min-h-0 w-full"
          style={{ '--sidebar-width': '20rem', '--sidebar-width-mobile': '18rem' } as React.CSSProperties}
        >
          <MainWithSettingsMargin>
            <StudioApp>
              <StudioApp.Tabs
                label="Editor tabs"
                leading={
                  <UnifiedMenubar
                    onOpenCreateListing={() => setCreateListingOpen(true)}
                    openProjectSwitcher={() => setProjectSwitcherOpen(true)}
                  />
                }
                actions={
                  <>
                    <ProjectSwitcher
                      projects={projectsQuery.data ?? []}
                      selectedProjectId={activeProjectId}
                      onProjectChange={setActiveProjectId}
                      open={projectSwitcherOpen}
                      onOpenChange={setProjectSwitcherOpen}
                      onCreateProject={async ({ name, description }) => {
                        const baseSlug = name
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '');
                        const existingSlugs = new Set((projectsQuery.data ?? []).map((p) => p.slug));
                        const rootSlug = baseSlug || `project-${Date.now()}`;
                        let slug = rootSlug;
                        let suffix = 2;
                        while (existingSlugs.has(slug)) {
                          slug = `${rootSlug}-${suffix}`;
                          suffix += 1;
                        }
                        const created = await createProjectMutation.mutateAsync({
                          title: name,
                          slug,
                          description,
                          domain: 'forge',
                        });
                        setActiveProjectId(created.id);
                        return { id: created.id, name: created.title };
                      }}
                      isLoading={projectsQuery.isLoading}
                      error={projectsQuery.error ? 'Failed to load projects' : null}
                      variant="compact"
                    />
                    <EditorButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openWorkspace('dialogue')}
                      className="border-0 text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircle className="size-3 shrink-0" />
                      Dialogue
                    </EditorButton>
                    <EditorButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openWorkspace('character')}
                      tooltip="Open or switch to Character editor"
                      className="border-0 text-muted-foreground hover:text-foreground"
                    >
                      <Users className="size-3 shrink-0" />
                      Character
                    </EditorButton>
                    <Separator orientation="vertical" className="h-[var(--control-height-sm)]" />
                    <SidebarTrigger
                      className="border-0 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle Settings"
                    >
                      <Settings className="size-4" />
                    </SidebarTrigger>
                  </>
                }
              >
                {visibleWorkspaceIds.map((id) => {
                  const descriptor = useEditorRegistryStore.getState().getEditor(id);
                  const Icon = descriptor?.icon ?? (id === 'dialogue' ? MessageCircle : Users);
                  const label = descriptor?.label ?? id;
                  return (
                    <StudioApp.Tab
                      key={id}
                      label={
                        <>
                          <Icon className="size-3 shrink-0" aria-hidden />
                          {label}
                        </>
                      }
                      isActive={activeWorkspaceId === id}
                      domain={id}
                      onSelect={() => setActiveWorkspace(id)}
                      onClose={openWorkspaceIds.length > 1 ? () => closeWorkspace(id) : undefined}
                    />
                  );
                })}
              </StudioApp.Tabs>

              <StudioApp.Content>
                <ActiveEditorContent activeWorkspaceId={activeWorkspaceId} />
              </StudioApp.Content>
              <CreateListingSheet open={createListingOpen} onOpenChange={setCreateListingOpen} />
              <AppSettingsSheet
                open={appSettingsSheetOpen}
                onOpenChange={setAppSettingsSheetOpen}
                activeEditorId={activeWorkspaceId}
                activeProjectId={activeProjectId != null ? String(activeProjectId) : null}
                viewportId={settingsViewportId ?? 'main'}
              />
              {toastsEnabled !== false && <Toaster />}
            </StudioApp>
          </MainWithSettingsMargin>

          <Sidebar side="right" collapsible="offcanvas" className="border-l border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border p-[var(--panel-padding)]">
              <h2 className="text-sm font-semibold text-sidebar-foreground">Settings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                App and editor defaults; viewport settings when in context.
              </p>
            </SidebarHeader>
            <SidebarContent className="flex-1 min-h-0">
              <AppSettingsPanelContent
                activeEditorId={activeWorkspaceId}
                activeProjectId={activeProjectId != null ? String(activeProjectId) : null}
                viewportId={settingsViewportId ?? 'main'}
                className="h-full"
              />
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </StudioMenubarProvider>
    </OpenSettingsSheetProvider>
  );
}
