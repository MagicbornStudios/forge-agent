/**
 * Declarative toolbar model. Data + slots; no imperative refs.
 */

import type { ReactNode } from 'react';

export type ToolbarAlign = 'start' | 'center' | 'end';

export interface ToolbarButtonItem {
  type: 'button';
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  tooltip?: ReactNode;
  tooltipDisabled?: boolean;
  /** @deprecated Typo alias for tooltipDisabled. */
  tootlipDisabled?: boolean;
}

export interface ToolbarToggleItem {
  type: 'toggle';
  id: string;
  label: string;
  icon?: ReactNode;
  pressed: boolean;
  onToggle: (pressed: boolean) => void;
  tooltip?: ReactNode;
  tooltipDisabled?: boolean;
  /** @deprecated Typo alias for tooltipDisabled. */
  tootlipDisabled?: boolean;
}

export interface ToolbarMenuItem {
  type: 'menu';
  id: string;
  label: string;
  icon?: ReactNode;
  children: ReactNode; // dropdown content
  tooltip?: ReactNode;
  tooltipDisabled?: boolean;
  /** @deprecated Typo alias for tooltipDisabled. */
  tootlipDisabled?: boolean;
}

export interface ToolbarCustomItem {
  type: 'custom';
  id: string;
  render: () => ReactNode;
}

export type ToolbarItem =
  | ToolbarButtonItem
  | ToolbarToggleItem
  | ToolbarMenuItem
  | ToolbarCustomItem;

export interface ToolbarGroup {
  id: string;
  align: ToolbarAlign;
  items: ToolbarItem[];
}
