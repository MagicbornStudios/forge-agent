/**
 * Declarative toolbar model. Data + slots; no imperative refs.
 */

import type { ReactNode } from 'react';
import type { CapabilityId } from '../entitlements/capabilities';

export type ToolbarGateMode = 'hide' | 'disable' | 'lock-overlay';

export interface ToolbarGateOptions {
  capability?: CapabilityId;
  gateMode?: ToolbarGateMode;
  gateReason?: string;
  gateActionLabel?: string;
  gateOnAction?: () => void;
  gateFallback?: ReactNode;
  gateClassName?: string;
}

export type ToolbarAlign = 'start' | 'center' | 'end';

export interface ToolbarButtonItem extends ToolbarGateOptions {
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
}

export interface ToolbarToggleItem extends ToolbarGateOptions {
  type: 'toggle';
  id: string;
  label: string;
  icon?: ReactNode;
  pressed: boolean;
  onToggle: (pressed: boolean) => void;
  tooltip?: ReactNode;
  tooltipDisabled?: boolean;
}

export interface ToolbarMenuItem extends ToolbarGateOptions {
  type: 'menu';
  id: string;
  label: string;
  icon?: ReactNode;
  children: ReactNode; // dropdown content
  tooltip?: ReactNode;
  tooltipDisabled?: boolean;
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
