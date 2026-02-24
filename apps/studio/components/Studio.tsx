'use client';

import React, { useMemo } from 'react';
import { useProjects, useCreateProject } from '@/lib/data/hooks';
import { ProjectSwitcher } from '@/components/ProjectSwitcher';
import { StudioApp } from '@forge/shared/components/app';
import {
  EditorMenubar,
  EditorFileMenu,
  EditorHelpMenu,
  type EditorMenubarItem,
} from '@forge/shared/components/editor';
import { AppSettingsSheet } from '@/components/settings/AppSettingsSheet';
import { CreateListingSheet } from '@/components/listings/CreateListingSheet';
import { useAppSettingsMenuItems } from '@/lib/settings/useAppSettingsMenuItems';
import { Toaster } from '@forge/ui/sonner';
import { SidebarTrigger } from '@forge/ui/sidebar';
import { CompanionRuntimeSwitch } from '@forge/shared';
import { useSettingsStore } from '@/lib/settings/store';
import { useWorkspaceRegistryStore } from '@/lib/workspace-registry/workspace-registry';
import { useMenuRegistry } from '@/lib/workspace-registry/workspace-menu-registry';
import { useAppShellStore } from '@/lib/app-shell/store';
import { MessageCircle, Settings, Users } from 'lucide-react';

const STUDIO_MENUBAR_TARGET = 'studio-menubar';

function UnifiedMenubar({
  onOpenCreateListing,
  openProjectSwitcher,
  openDialogueWorkspace,
  openCharacterWorkspace,
  mergeEditorMenus = true,
}: {
  onOpenCreateListing: () => void;
  openProjectSwitcher?: () => void;
  openDialogueWorkspace: () => void;
  openCharacterWorkspace: () => void;
  mergeEditorMenus?: boolean;
}) {
  const activeWorkspaceId = useAppShellStore((s) => s.route.activeWorkspaceId);
  const editorMenus = useMenuRegistry(
    mergeEditorMenus ? STUDIO_MENUBAR_TARGET : undefined,
    mergeEditorMenus ? activeWorkspaceId : null
  );
  const appSettingsItems = useAppSettingsMenuItems({ onOpenCreateListing });
  const merged = useMemo(() => {
    const helpItems = [EditorHelpMenu.Welcome(), EditorHelpMenu.About()];
    const editorsSubmenu: EditorMenubarItem = {
      id: 'file-editors',
      label: 'Editors',
      submenu: [
        { id: 'file-open-dialogue-editor', label: 'Dialogue', onSelect: openDialogueWorkspace },
        { id: 'file-open-character-editor', label: 'Character', onSelect: openCharacterWorkspace },
      ],
    };
    const stripEdgeSeparators = (items: EditorMenubarItem[]): EditorMenubarItem[] => {
      let start = 0;
      let end = items.length;
      while (start < end && items[start]?.type === 'separator') start += 1;
      while (end > start && items[end - 1]?.type === 'separator') end -= 1;
      return items.slice(start, end);
    };
    const baseFileItems: EditorMenubarItem[] = [];
    if (openProjectSwitcher) {
      baseFileItems.push(EditorFileMenu.SwitchProject({ onSelect: openProjectSwitcher }));
      baseFileItems.push(EditorFileMenu.Separator('file-sep-before-editors'));
    }
    baseFileItems.push(editorsSubmenu);

    if (!mergeEditorMenus) {
      return [
        { id: 'file', label: 'File', items: baseFileItems },
        { id: 'settings', label: 'Settings', items: appSettingsItems },
        { id: 'help', label: 'Help', items: helpItems },
      ];
    }
    const fileMenuFromEditor = editorMenus.find((m) => m.id === 'file');
    const otherEditorMenus = editorMenus.filter((m) => m.id !== 'file');
    const contributedFileItems = stripEdgeSeparators(fileMenuFromEditor?.items ?? []);
    const fileItems: EditorMenubarItem[] =
      contributedFileItems.length > 0
        ? [
            ...baseFileItems,
            EditorFileMenu.Separator('file-sep-before-editor-items'),
            ...contributedFileItems,
          ]
        : baseFileItems;
    return [
      { id: 'file', label: 'File', items: fileItems },
      ...otherEditorMenus,
      { id: 'settings', label: 'Settings', items: appSettingsItems },
      { id: 'help', label: 'Help', items: helpItems },
    ];
  }, [
    mergeEditorMenus,
    editorMenus,
    appSettingsItems,
    openProjectSwitcher,
    openDialogueWorkspace,
    openCharacterWorkspace,
  ]);
  return <EditorMenubar menus={merged} />;
}

function ActiveEditorContent({ activeWorkspaceId }: { activeWorkspaceId: string }) {
  const descriptor = useWorkspaceRegistryStore((s) => s.workspaces[activeWorkspaceId]);
  const Component = descriptor?.component;
  if (!Component) return null;
  return <Component />;
}

/**
 * Studio content: tabs, editor content, sheets, toaster.
 * AppProviders owns the full shell (SidebarProvider, Settings sidebar, OpenSettingsSheet, StudioMenubar).
 */
export function Studio() {
  const {
    route,
    activeProjectId,
    setActiveProjectId,
    setActiveWorkspace,
    openWorkspace,
    closeWorkspace,
  } = useAppShellStore();
  const appSettingsSheetOpen = useAppShellStore((s) => s.appSettingsSheetOpen);
  const setAppSettingsSheetOpen = useAppShellStore((s) => s.setAppSettingsSheetOpen);
  const settingsViewportId = useAppShellStore((s) => s.settingsViewportId);
  const { activeWorkspaceId, openWorkspaceIds } = route;

  const [projectSwitcherOpen, setProjectSwitcherOpen] = React.useState(false);
  const [createListingOpen, setCreateListingOpen] = React.useState(false);
  const projectsQuery = useProjects();
  const createProjectMutation = useCreateProject();

  React.useEffect(() => {
    if (activeProjectId != null) return;
    const projects = projectsQuery.data ?? [];
    if (projects.length > 0) setActiveProjectId(projects[0].id);
  }, [activeProjectId, projectsQuery.data, setActiveProjectId]);

  const toastsEnabled = useSettingsStore((s) => s.getSettingValue('ui.toastsEnabled')) as
    | boolean
    | undefined;
  const visibleWorkspaceIds = openWorkspaceIds;

  return (
    <>
      <StudioApp>
        <StudioApp.Tabs label="Editor tabs" tabListClassName="justify-center">
          <StudioApp.Tabs.Left>
            <div className="flex items-center gap-[var(--control-gap,0.375rem)] pr-[calc(var(--control-gap,0.375rem)*2)]">
              <UnifiedMenubar
                onOpenCreateListing={() => setCreateListingOpen(true)}
                openProjectSwitcher={() => setProjectSwitcherOpen(true)}
                openDialogueWorkspace={() => openWorkspace('dialogue')}
                openCharacterWorkspace={() => openWorkspace('character')}
              />
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
            </div>
          </StudioApp.Tabs.Left>

          <StudioApp.Tabs.Main>
            {visibleWorkspaceIds.map((id) => {
              const descriptor = useWorkspaceRegistryStore.getState().getWorkspace(id);
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
          </StudioApp.Tabs.Main>

          <StudioApp.Tabs.Right>
            <CompanionRuntimeSwitch />
            <SidebarTrigger
              className="h-[var(--control-height-sm)] w-[var(--control-height-sm)] border border-border/60 bg-background text-muted-foreground shadow-[var(--shadow-xs)] hover:bg-accent/40 hover:text-foreground"
              aria-label="Toggle Settings"
            >
              <Settings className="size-4" />
            </SidebarTrigger>
          </StudioApp.Tabs.Right>
        </StudioApp.Tabs>

        <StudioApp.Content>
          <ActiveEditorContent activeWorkspaceId={activeWorkspaceId} />
        </StudioApp.Content>
        <CreateListingSheet open={createListingOpen} onOpenChange={setCreateListingOpen} />
        <AppSettingsSheet
          open={appSettingsSheetOpen}
          onOpenChange={setAppSettingsSheetOpen}
          activeWorkspaceId={activeWorkspaceId}
          activeProjectId={activeProjectId != null ? String(activeProjectId) : null}
          viewportId={settingsViewportId ?? 'main'}
        />
        {toastsEnabled !== false && <Toaster />}
      </StudioApp>
    </>
  );
}
