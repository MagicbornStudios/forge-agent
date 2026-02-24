import type { RepoWorkspaceId } from '@/lib/types';
import {
  getWorkspacePanelSpecs,
  type RepoWorkspacePanelSpec,
} from './workspace-layout-definitions';

export type RepoEditorPanelSpec = RepoWorkspacePanelSpec;

export function getEditorPanelSpecsForWorkspace(workspaceId: RepoWorkspaceId): RepoEditorPanelSpec[] {
  return getWorkspacePanelSpecs(workspaceId);
}

export function panelIdFromVisibilityKey(
  workspaceId: RepoWorkspaceId,
  key: string,
): string | null {
  const normalized = String(key || '').trim();
  const panel = getWorkspacePanelSpecs(workspaceId).find((spec) => spec.key === normalized);
  return panel?.id || null;
}

