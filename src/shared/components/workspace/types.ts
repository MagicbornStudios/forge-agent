import type { ReactNode } from 'react';

/** Stable workspace identifier (e.g. "forge", "writer", "video"). */
export type WorkspaceId = string;

/** Surface slot keys: Header, Toolbar, Left, Main, Right, StatusBar, Bottom, Overlays. */
export type WorkspaceSlotKey =
  | 'header'
  | 'toolbar'
  | 'left'
  | 'main'
  | 'inspector'
  | 'statusBar'
  | 'bottom'
  | 'overlays';

/** Props for the workspace shell. All slots are optional; layout is composed via WorkspaceLayoutGrid. */
export interface WorkspaceShellProps {
  workspaceId: WorkspaceId;
  title: string;
  subtitle?: string;
  /** Optional domain for context theming (data-domain). */
  domain?: string;
  /** Optional theme override for this workspace (data-theme). */
  theme?: string;
  /** Optional class for the root element. */
  className?: string;
  children?: ReactNode;
}

/** Optional platform entitlements (e.g. for paywalls). Shell does not implement; host can pass. */
export interface WorkspaceEntitlements {
  canExport?: boolean;
  canUseTemplates?: boolean;
  [key: string]: boolean | undefined;
}

/** Optional feature flags. Shell does not implement; host can pass. */
export interface WorkspaceFlags {
  [key: string]: boolean | undefined;
}
