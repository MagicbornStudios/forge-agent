import type { ComponentType } from 'react';
import type { WorkspacePanelSpec } from '@forge/shared';

import {
  BUILTIN_REPO_WORKSPACE_COMPONENTS,
  EXTENSION_WORKSPACE_COMPONENTS,
  type RepoWorkspaceProps,
} from '@/components/workspaces';
import type { RepoWorkspaceExtension } from '@/lib/api/types';
import {
  getWorkspaceLayoutDefinition,
  WORKSPACE_IDS as BUILTIN_WORKSPACE_IDS,
  WORKSPACE_LABELS,
  type WorkspaceId,
} from '@/lib/app-spec.generated';

export type RepoWorkspaceCatalogEntry = {
  id: string;
  label: string;
  layoutId: string;
  panelSpecs: WorkspacePanelSpec[];
  mainPanelIds: string[];
  mainAnchorPanelId: string;
  component: ComponentType<RepoWorkspaceProps>;
  kind: 'built-in' | 'extension';
  workspaceKind?: string;
  extension?: RepoWorkspaceExtension;
};

export type RepoWorkspaceCatalog = {
  entries: RepoWorkspaceCatalogEntry[];
  byId: Record<string, RepoWorkspaceCatalogEntry>;
  ids: string[];
  labels: Record<string, string>;
};

function normalizeWorkspaceToken(input: string) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'workspace';
}

function extensionLayoutId(workspaceId: string) {
  return `repo-ext-${normalizeWorkspaceToken(workspaceId)}`;
}

function extensionPanelSpecs(workspaceId: string): {
  panelSpecs: WorkspacePanelSpec[];
  mainPanelIds: string[];
  mainAnchorPanelId: string;
} {
  const token = normalizeWorkspaceToken(workspaceId);
  return {
    panelSpecs: [
      { id: 'workspace', rail: 'main', label: 'Workspace', key: `panel.visible.ext.${token}.workspace` },
      { id: 'assistant', rail: 'right', label: 'Assistant', key: `panel.visible.ext.${token}.assistant` },
    ],
    mainPanelIds: ['workspace'],
    mainAnchorPanelId: 'workspace',
  };
}

export function createRepoWorkspaceCatalog(extensions: RepoWorkspaceExtension[]): RepoWorkspaceCatalog {
  const entries: RepoWorkspaceCatalogEntry[] = [];

  for (const workspaceId of BUILTIN_WORKSPACE_IDS) {
    const component = BUILTIN_REPO_WORKSPACE_COMPONENTS[workspaceId];
    if (!component) continue;
    const definition = getWorkspaceLayoutDefinition(workspaceId as WorkspaceId);
    entries.push({
      id: workspaceId,
      label: WORKSPACE_LABELS[workspaceId as WorkspaceId] || workspaceId,
      layoutId: definition.layoutId,
      panelSpecs: definition.panelSpecs,
      mainPanelIds: definition.mainPanelIds,
      mainAnchorPanelId: definition.mainAnchorPanelId,
      component,
      kind: 'built-in',
    });
  }

  for (const extension of extensions || []) {
    const workspaceId = String(extension.workspaceId || '').trim();
    if (!workspaceId) continue;
    const workspaceKind = String(extension.workspaceKind || 'generic').trim().toLowerCase();
    const component = EXTENSION_WORKSPACE_COMPONENTS[workspaceKind] || EXTENSION_WORKSPACE_COMPONENTS.generic;
    const token = normalizeWorkspaceToken(workspaceId);

    const extensionLayoutFromPayload = extension.layout && Array.isArray(extension.layout.panelSpecs)
      ? {
          layoutId: String(extension.layout.layoutId || '').trim() || extensionLayoutId(workspaceId),
          panelSpecs: extension.layout.panelSpecs
            .map((panel) => ({
              id: String(panel.id || '').trim(),
              rail: panel.rail,
              label: String(panel.label || panel.id || '').trim(),
              key: String(panel.key || '').trim() || `panel.visible.ext.${token}.${String(panel.id || '').trim()}`,
            }))
            .filter((panel) => panel.id && panel.label && panel.rail),
          mainPanelIds: Array.isArray(extension.layout.mainPanelIds)
            ? extension.layout.mainPanelIds.map((id) => String(id || '').trim()).filter(Boolean)
            : [],
          mainAnchorPanelId: String(extension.layout.mainAnchorPanelId || '').trim(),
        }
      : null;
    const extensionFallback = extensionPanelSpecs(workspaceId);

    const resolvedLayout = (
      extensionLayoutFromPayload && extensionLayoutFromPayload.panelSpecs.length > 0
        ? {
            layoutId: extensionLayoutFromPayload.layoutId,
            panelSpecs: extensionLayoutFromPayload.panelSpecs,
            mainPanelIds: extensionLayoutFromPayload.mainPanelIds.length > 0
              ? extensionLayoutFromPayload.mainPanelIds
              : extensionLayoutFromPayload.panelSpecs
                .filter((panel) => panel.rail === 'main')
                .map((panel) => panel.id),
            mainAnchorPanelId: extensionLayoutFromPayload.mainAnchorPanelId
              || extensionLayoutFromPayload.mainPanelIds[0]
              || extensionLayoutFromPayload.panelSpecs.find((panel) => panel.rail === 'main')?.id
              || extensionLayoutFromPayload.panelSpecs[0]?.id
              || extensionFallback.mainAnchorPanelId,
          }
        : {
            layoutId: extensionLayoutId(workspaceId),
            panelSpecs: extensionFallback.panelSpecs,
            mainPanelIds: extensionFallback.mainPanelIds,
            mainAnchorPanelId: extensionFallback.mainAnchorPanelId,
          }
    );

    entries.push({
      id: workspaceId,
      label: String(extension.label || workspaceId),
      layoutId: resolvedLayout.layoutId,
      panelSpecs: resolvedLayout.panelSpecs,
      mainPanelIds: resolvedLayout.mainPanelIds,
      mainAnchorPanelId: resolvedLayout.mainAnchorPanelId,
      component,
      kind: 'extension',
      workspaceKind,
      extension,
    });
  }

  const byId: Record<string, RepoWorkspaceCatalogEntry> = {};
  for (const entry of entries) {
    if (!byId[entry.id]) {
      byId[entry.id] = entry;
    }
  }
  const ids = Object.keys(byId);
  const labels = ids.reduce((acc, id) => {
    acc[id] = byId[id].label;
    return acc;
  }, {} as Record<string, string>);

  return {
    entries: ids.map((id) => byId[id]),
    byId,
    ids,
    labels,
  };
}

export function getWorkspaceCatalogEntry(
  catalog: RepoWorkspaceCatalog,
  workspaceId: string,
): RepoWorkspaceCatalogEntry {
  return catalog.byId[workspaceId] || catalog.byId.planning || catalog.entries[0];
}
