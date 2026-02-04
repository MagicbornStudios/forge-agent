/**
 * Declarative overlays (modals, drawers, popovers). No registry; one list per workspace.
 */

import type { ReactNode } from 'react';

export type OverlaySize = 'sm' | 'md' | 'lg' | 'full';

export interface OverlaySpec<P = Record<string, unknown>> {
  id: string;
  type: 'modal' | 'drawer' | 'popover';
  title?: string;
  size?: OverlaySize;
  /** Render the overlay content. Workspace declares this in one place. */
  render: (props: { payload?: P; onDismiss: () => void }) => ReactNode;
}

/** Currently active overlay: id + optional payload. From workspace store/state. */
export interface ActiveOverlay<P = Record<string, unknown>> {
  id: string;
  payload?: P;
}
