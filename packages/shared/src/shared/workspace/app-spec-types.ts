/**
 * Canonical types for studio app spec (codegen output).
 * Used by @forge/forge-codegen and consumed by all studio apps (repo-studio, studio, consumer-studio).
 */

export type PanelRail = 'left' | 'main' | 'right' | 'bottom';

export interface WorkspacePanelSpec {
  id: string;
  label: string;
  key: string;
  rail: PanelRail;
}

export interface WorkspaceLayoutDefinition {
  workspaceId: string;
  label: string;
  layoutId: string;
  mainAnchorPanelId: string;
  mainPanelIds: string[];
  panelSpecs: WorkspacePanelSpec[];
}
