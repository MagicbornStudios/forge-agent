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
import { toast } from 'sonner';
import { SettingsService } from '@/lib/api-client';
import {
  APP_SETTINGS_SECTIONS,
  PROJECT_SETTINGS_SECTIONS,
  EDITOR_SETTINGS_SECTIONS,
  VIEWPORT_SETTINGS_SECTIONS,
} from './ai-settings';
import type { SettingsSection } from './types';

export interface AppSettingsPanelContentProps {
  activeEditorId?: string | null;
  activeProjectId?: string | null;
  viewportId?: string;
  className?: string;
}

type TabId = 'app' | 'user' | 'project' | 'editor' | 'viewport';
type AppUserCategoryId = 'ai' | 'appearance' | 'panels' | 'other';

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
  'panel.visible.dialogue-right': <LayoutPanelTop className={iconSize} />,
  'panel.visible.dialogue-bottom': <LayoutPanelTop className={iconSize} />,
  'panel.visible.character-left': <LayoutPanelTop className={iconSize} />,
  'panel.visible.character-right': <LayoutPanelTop className={iconSize} />,
  'panel.visible.video-right': <LayoutPanelTop className={iconSize} />,
  'panel.visible.video-bottom': <LayoutPanelTop className={iconSize} />,
  'panel.visible.strategy-left': <LayoutPanelTop className={iconSize} />,
  'panel.visible.strategy-right': <LayoutPanelTop className={iconSize} />,
  'graph.showMiniMap': <Map className={iconSize} />,
  'graph.animatedEdges': <Zap className={iconSize} />,
  'graph.layoutAlgorithm': <Network className={iconSize} />,
};

function filterSectionsByIds(sections: SettingsSection[], ids: string[]): SettingsSection[] {
  return sections.filter((s) => ids.includes(s.id));
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
}: AppSettingsPanelContentProps) {
  const getOverridesForScope = useSettingsStore((s) => s.getOverridesForScope);
  const [activeTab, setActiveTab] = React.useState<TabId>('app');
  const [appUserCategory, setAppUserCategory] = React.useState<AppUserCategoryId>('ai');
  const [saving, setSaving] = React.useState(false);

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

  const appUserInnerTabs = React.useMemo<SettingsTabDef[]>(
    () => [
      {
        id: 'ai',
        label: 'AI',
        icon: <Bot className="size-[var(--icon-size)]" />,
        content: (
          <SettingsPanel
            scope={SETTINGS_SCOPE.APP}
            sections={filterSectionsByIds(APP_SETTINGS_SECTIONS, ['ai-core'])}
            sectionIcons={SECTION_ICONS}
            fieldIcons={FIELD_ICONS}
          />
        ),
      },
      {
        id: 'appearance',
        label: 'Appearance',
        icon: <Palette className="size-[var(--icon-size)]" />,
        content: (
          <SettingsPanel
            scope="app"
            sections={filterSectionsByIds(APP_SETTINGS_SECTIONS, ['ui'])}
            sectionIcons={SECTION_ICONS}
          />
        ),
      },
      {
        id: 'panels',
        label: 'Panels',
        icon: <LayoutPanelTop className="size-[var(--icon-size)]" />,
        content: (
          <SettingsPanel
            scope={SETTINGS_SCOPE.APP}
            sections={filterSectionsByIds(APP_SETTINGS_SECTIONS, ['panels'])}
            sectionIcons={SECTION_ICONS}
            fieldIcons={FIELD_ICONS}
          />
        ),
      },
      {
        id: 'other',
        label: 'Other',
        icon: <Settings className="size-[var(--icon-size)]" />,
        content: (
          <SettingsPanel
            scope={SETTINGS_SCOPE.APP}
            sections={filterSectionsByIds(APP_SETTINGS_SECTIONS, ['other'])}
            sectionIcons={SECTION_ICONS}
            fieldIcons={FIELD_ICONS}
          />
        ),
      },
    ],
    []
  );

  const topLevelTabs = React.useMemo<SettingsTabDef[]>(() => {
    const tabs: SettingsTabDef[] = [
      {
        id: 'app',
        label: 'App',
        icon: <Sliders className="size-[var(--icon-size)]" />,
        content: (
          <SettingsTabs
            tabs={appUserInnerTabs}
            value={appUserCategory}
            onValueChange={(v) => setAppUserCategory(v as AppUserCategoryId)}
            tabsListClassName="grid w-full grid-cols-4"
          />
        ),
      },
      {
        id: 'user',
        label: 'User',
        icon: <User className="size-[var(--icon-size)]" />,
        content: (
          <SettingsTabs
            tabs={appUserInnerTabs}
            value={appUserCategory}
            onValueChange={(v) => setAppUserCategory(v as AppUserCategoryId)}
            tabsListClassName="grid w-full grid-cols-4"
          />
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
              sections={PROJECT_SETTINGS_SECTIONS}
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
              sections={EDITOR_SETTINGS_SECTIONS}
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
          activeEditorId != null ? (
            <SettingsPanel
              scope={SETTINGS_SCOPE.VIEWPORT}
              sections={VIEWPORT_SETTINGS_SECTIONS}
              editorId={activeEditorId}
              viewportId={viewportId}
              sectionIcons={SECTION_ICONS}
              fieldIcons={FIELD_ICONS}
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
    appUserInnerTabs,
  ]);

  return (
    <div className={className ?? 'flex flex-col h-full min-h-0 p-[var(--panel-padding)]'}>
      <SettingsTabs
        tabs={topLevelTabs}
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabId)}
        className="flex-1 min-h-0"
        tabsListClassName="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      />
      <div className="mt-4 pt-4 border-t flex justify-end shrink-0">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
