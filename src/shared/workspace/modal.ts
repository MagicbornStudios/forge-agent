/**
 * Shared modal routing. Consistent modal lifecycle across workspaces.
 * WorkspaceModalHost reads modalStack from store and renders; each workspace
 * registers modal components in a declarative registry.
 */

import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalRoute {
  key: string;
  title?: string;
  payload?: Record<string, unknown>;
  size?: ModalSize;
}

export type ModalComponentProps<T = Record<string, unknown>> = {
  route: ModalRoute & { payload?: T };
  onClose: () => void;
};

/** Render function for a modal. Host/workspace provides the map key -> render. */
export type ModalRenderer = (props: ModalComponentProps) => ReactNode;

/** Registry: modal key -> render. Host/workspace provides the map. */
export type ModalRegistry = Map<string, ModalRenderer>;
