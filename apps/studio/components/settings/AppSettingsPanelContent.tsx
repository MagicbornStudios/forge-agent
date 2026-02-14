'use client';

import * as React from 'react';
import {
  Bell,
  Bot,
  FileText,
  FolderKanban,
  Layout,
  LayoutGrid,
  LayoutPanelTop,
  Lock,
  Map,
  Monitor,
  Network,
  Palette,
  Settings,
  Sliders,
  Thermometer,
  User,
  Wrench,
  Zap,
} from 'lucide-react';

const iconSize = 'size-[var(--icon-size)]';
import { Button } from '@forge/ui/button';
import { useSettingsStore, SETTINGS_SCOPE, type SettingsScope } from '@/lib/settings/store';
import { SettingsTabs, type SettingsTabDef } from '@forge/shared';
import { SettingsPanel } from './SettingsPanel';
import { AppSettingsProvider } from './AppSettingsProvider';
import { AppSettingsRegistrations } from './AppSettingsRegistrations';
import { ViewportSettingsProvider } from './ViewportSettingsProvider';
import { GraphViewportSettings } from './GraphViewportSettings';
import { toast } from 'sonner';
import { SettingsService } from '@/lib/api-client';
import {
  SETTINGS_SCOPE_COLORS,
  VIEWPORT_ACCENT_COLORS,
} from '@/lib/app-shell/editor-metadata';
import { useEditorStore } from '@/lib/app-shell/store';
import type { SettingsSection } from './types';

export interface AppSettingsPanelContentProps {
  activeEditorId?: string | null;
  activeProjectId?: string | null;
  viewportId?: string;
  className?: string;
  /** When provided (e.g. when rendered inside Dockview slot), inner tab updates trigger parent re-render so the slot shows the correct tab. */
  controlledCategory?: AppSettingsPanelContentControlledCategory;
}

type TabId = 'app' | 'user' | 'project' | 'editor' | 'viewport';
export type AppUserCategoryId = 'ai' | 'appearance' | 'panels' | 'other';

export interface AppSettingsPanelContentControlledCategory {
  appUserCategory: AppUserCategoryId;
  onAppUserCategoryChange: (id: AppUserCategoryId) => void;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'ai-core': <Bot className={iconSize} />,
  ui: <Palette className={iconSize} />,
  panels: <LayoutPanelTop className={iconSize} />,
  'graph-viewport': <Map className={iconSize} />,
  other: <Settings className={iconSize} />,
  'project-ai': <Bot className={iconSize} />,
  'project-ui': <Palette className={iconSize} />,
  'editor-ai': <Bot className={iconSize} />,
  'editor-ui': <Palette className={iconSize} />,
  'viewport-ai': <Bot className={iconSize} />,
  'viewport-ui': <Palette className={iconSize} />,
};

/** Icons for each settings field key (labels and rows). */
const FIELD_ICONS: Record<string, React.ReactNode> = {
  'ai.agentName': <Bot className={iconSize} />,
  'ai.instructions': <FileText className={iconSize} />,
  'ai.responsesCompatOnly': <Zap className={iconSize} />,
  'ai.temperature': <Thermometer className={iconSize} />,
  'ai.toolsEnabled': <Wrench className={iconSize} />,
  'ai.showAgentName': <User className={iconSize} />,
  'ui.theme': <Palette className={iconSize} />,
  'ui.density': <LayoutGrid className={iconSize} />,
  'ui.toastsEnabled': <Bell className={iconSize} />,
  'editor.locked': <Lock className={iconSize} />,
  'panel.visible.dialogue-left': <LayoutPanelTop className={iconSize} />,
  'panel.visible.dialogue-main': <LayoutPanelTop className={iconSize} />,
  'panel.visible.dialogue-right': <LayoutPanelTop className={iconSize} />,
  'panel.visible.dialogue-chat': <LayoutPanelTop className={iconSize} />,
  'panel.visible.dialogue-bottom': <LayoutPanelTop className={iconSize} />,
  'panel.visible.character-left': <LayoutPanelTop className={iconSize} />,
  'panel.visible.character-right': <LayoutPanelTop className={iconSize} />,
  'panel.visible.character-chat': <LayoutPanelTop className={iconSize} />,
  'graph.showMiniMap': <Map className={iconSize} />,
  'graph.animatedEdges': <Zap className={iconSize} />,
  'graph.layoutAlgorithm': <Network className={iconSize} />,
};

/** No project/editor registration in tree yet; empty until we add scope registration. */
const PROJECT_SECTIONS_PLACEHOLDER: SettingsSection[] = [];
const EDITOR_SECTIONS_PLACEHOLDER: SettingsSection[] = [];

function ViewportSettingsContent({
  activeEditorId,
  viewportId,
}: {
  activeEditorId: string;
  viewportId: string;
}) {
  const accentColor =
    VIEWPORT_ACCENT_COLORS[`${activeEditorId}:${viewportId}`] ?? 'var(--context-accent)';
  const contextLabel =
    activeEditorId === 'dialogue'
      ? viewportId === 'narrative'
        ? 'Narrative graph'
        : viewportId === 'storylet'
          ? 'Storylet graph'
          : viewportId
      : activeEditorId === 'character'
        ? 'Character graph'
        : `${activeEditorId}: ${viewportId}`;

  return (
    <div className="flex flex-col gap-[var(--control-gap)]">
      <p className="text-xs text-muted-foreground">
        Context: <span className="font-medium text-foreground">{contextLabel}</span>
      </p>
      <ViewportSettingsProvider editorId={activeEditorId} viewportId={viewportId}>
        <GraphViewportSettings accentBorderColor={accentColor} />
      </ViewportSettingsProvider>
    </div>
  );
}

function getScopeAndId(
  tab: TabId,
  activeEditorId?: string | null,
  activeProjectId?: string | null,
  viewportId?: string
): { scope: SettingsScope; scopeId: string | null } {
  if (tab === 'app' || tab === 'user') return { scope: 'app', scopeId: null };
  if (tab === 'project' && activeProjectId) return { scope: 'project', scopeId: activeProjectId };
  if (tab === 'editor' && activeEditorId) return { scope: 'editor', scopeId: activeEditorId };
  if (tab === 'viewport' && activeEditorId && viewportId) {
    return { scope: 'viewport', scopeId: `${activeEditorId}:${viewportId}` };
  }
  return { scope: 'app', scopeId: null };
}

export function AppSettingsPanelContent({
  activeEditorId,
  activeProjectId,
  viewportId = 'main',
  className,
  controlledCategory,
}: AppSettingsPanelContentProps) {
  const getOverridesForScope = useSettingsStore((s) => s.getOverridesForScope);
  const settingsSidebarOpen = useEditorStore((s) => s.settingsSidebarOpen);
  const setSettingsActiveTab = useEditorStore((s) => s.setSettingsActiveTab);
  const [activeTab, setActiveTab] = React.useState<TabId>('app');
  const [saving, setSaving] = React.useState(false);

  const handleTabChange = React.useCallback(
    (v: string) => {
      const tab = v as TabId;
      setActiveTab(tab);
      setSettingsActiveTab(tab);
    },
    [setSettingsActiveTab]
  );

  React.useEffect(() => {
    if (settingsSidebarOpen) {
      setSettingsActiveTab(activeTab);
    }
    return () => setSettingsActiveTab(null);
  }, [activeTab, setSettingsActiveTab, settingsSidebarOpen]);

  const handleSave = React.useCallback(async () => {
    const { scope, scopeId } = getScopeAndId(
      activeTab,
      activeEditorId,
      activeProjectId,
      viewportId
    );
    if (scope !== SETTINGS_SCOPE.APP && scopeId === null) {
      toast.error('Cannot save', { description: 'This scope requires a selection.' });
      return;
    }
    const ids =
      scope === SETTINGS_SCOPE.PROJECT
        ? { projectId: scopeId ?? undefined }
        : scope === SETTINGS_SCOPE.EDITOR
          ? { editorId: scopeId ?? undefined }
          : scope === SETTINGS_SCOPE.VIEWPORT
            ? { editorId: activeEditorId ?? undefined, viewportId }
            : undefined;
    const settings = getOverridesForScope(scope, ids);
    setSaving(true);
    try {
      await SettingsService.postApiSettings({
        scope,
        scopeId,
        settings,
      } as Parameters<typeof SettingsService.postApiSettings>[0]);
      toast.success('Settings saved', {
        description: 'Your preferences will persist after refresh.',
      });
    } catch (e) {
      toast.error('Failed to save settings', {
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  }, [
    activeTab,
    activeEditorId,
    activeProjectId,
    viewportId,
    getOverridesForScope,
  ]);

  const showProject = activeProjectId != null;
  const showEditor = activeEditorId != null;
  const showViewport = activeEditorId != null;

  const topLevelTabs = React.useMemo<SettingsTabDef[]>(() => {
    const tabs: SettingsTabDef[] = [
      {
        id: 'app',
        label: 'App',
        icon: <Sliders className="size-[var(--icon-size)]" />,
        content: (
          <AppSettingsProvider>
            <AppSettingsRegistrations />
          </AppSettingsProvider>
        ),
      },
      {
        id: 'user',
        label: 'User',
        icon: <User className="size-[var(--icon-size)]" />,
        content: (
          <AppSettingsProvider>
            <AppSettingsRegistrations />
          </AppSettingsProvider>
        ),
      },
      {
        id: 'project',
        label: 'Project',
        icon: <FolderKanban className="size-[var(--icon-size)]" />,
        disabled: !showProject,
        content:
          activeProjectId != null ? (
            <SettingsPanel
              scope={SETTINGS_SCOPE.PROJECT}
              sections={PROJECT_SECTIONS_PLACEHOLDER}
              projectId={activeProjectId}
              sectionIcons={SECTION_ICONS}
              fieldIcons={FIELD_ICONS}
            />
          ) : null,
      },
      {
        id: 'editor',
        label: 'Editor',
        icon: <Monitor className="size-[var(--icon-size)]" />,
        disabled: !showEditor,
        content:
          activeEditorId != null ? (
            <SettingsPanel
              scope={SETTINGS_SCOPE.EDITOR}
              sections={EDITOR_SECTIONS_PLACEHOLDER}
              editorId={activeEditorId}
              sectionIcons={SECTION_ICONS}
            />
          ) : null,
      },
      {
        id: 'viewport',
        label: 'Viewport',
        icon: <Layout className="size-[var(--icon-size)]" />,
        disabled: !showViewport,
        content:
          activeEditorId != null && viewportId ? (
            <ViewportSettingsContent
              activeEditorId={activeEditorId}
              viewportId={viewportId}
            />
          ) : null,
      },
    ];
    return tabs;
  }, [
    showProject,
    showEditor,
    showViewport,
    activeProjectId,
    activeEditorId,
    viewportId,
  ]);

  return (
    <div className={className ?? 'flex flex-col h-full min-h-0 p-[var(--panel-padding)]'}>
      <SettingsTabs
        tabs={topLevelTabs}
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 min-h-0"
        tabsListClassName="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        iconOnly
        tabAccentColors={SETTINGS_SCOPE_COLORS}
      />
      <div className="mt-4 pt-4 border-t flex justify-end shrink-0">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
