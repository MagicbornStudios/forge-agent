/**
 * Workspace composition spec. One place per workspace fills in the template.
 */

import type { ReactNode } from 'react';
import type { OverlaySpec } from './overlays';

/** Layout visibility/widths (persistable later). Shell does not require it. */
export interface WorkspaceLayoutConfig {
  leftVisible?: boolean;
  leftWidth?: number;
  rightVisible?: boolean;
  rightWidth?: number;
  bottomVisible?: boolean;
  bottomHeight?: number;
}

export interface WorkspaceUISpec {
  layout?: WorkspaceLayoutConfig;
  /** Slots: declarative content. */
  slots: {
    header?: ReactNode;
    toolbar?: ReactNode;
    left?: ReactNode;
    main: ReactNode;
    right?: ReactNode;
    statusBar?: ReactNode;
    bottom?: ReactNode;
  };
  /** Declarative overlay definitions. No registry; list in one place per workspace. */
  overlays: OverlaySpec[];
}
