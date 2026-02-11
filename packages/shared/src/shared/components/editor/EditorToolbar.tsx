'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { Separator } from '@forge/ui/separator';
import type { ToolbarGroup, ToolbarItem } from '../../workspace';
import { EditorButton } from './EditorButton';
import { FeatureGate } from '../gating/FeatureGate';
import { EditorFileMenu } from './toolbar/EditorFileMenu';
import { EditorMenubar } from './toolbar/EditorMenubar';
import { EditorProjectSelect } from './toolbar/EditorProjectSelect';

export interface EditorToolbarProps {
  children?: React.ReactNode;
  /** When provided, toolbar renders from data. Otherwise use Left/Center/Right slots. */
  groups?: ToolbarGroup[];
  className?: string;
}

function ToolbarSection({
  children,
  className,
  align = 'start',
}: {
  children?: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-[var(--control-gap)]',
        align === 'center' && 'flex-none justify-center',
        align === 'start' && 'flex-1 justify-start',
        align === 'end' && 'flex-1 justify-end',
        className,
      )}
    >
      {children}
    </div>
  );
}

function ToolbarSeparator() {
  return <Separator orientation="vertical" className="h-[var(--control-height-sm)]" />;
}

function ToolbarGroupEl({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex items-center gap-[var(--control-gap)]', className)}>{children}</div>;
}

function renderToolbarItem(item: ToolbarItem) {
  switch (item.type) {
    case 'button': {
      const button = (
        <EditorButton
          key={item.id}
          variant={item.variant ?? 'outline'}
          size={item.size ?? 'sm'}
          disabled={item.disabled}
          onClick={item.onClick}
          tooltip={typeof item.tooltip === 'string' ? item.tooltip : undefined}
          tooltipDisabled={item.tooltipDisabled}
        >
          {item.icon}
          {item.label}
        </EditorButton>
      );
      if (!item.capability) return button;
      return (
        <FeatureGate
          key={item.id}
          capability={item.capability}
          mode={item.gateMode}
          reason={item.gateReason}
          actionLabel={item.gateActionLabel}
          onAction={item.gateOnAction}
          fallback={item.gateFallback}
          className={item.gateClassName}
        >
          {button}
        </FeatureGate>
      );
    }
    case 'toggle': {
      const toggle = (
        <EditorButton
          key={item.id}
          variant="outline"
          size="sm"
          onClick={() => item.onToggle(!item.pressed)}
          data-state={item.pressed ? 'on' : 'off'}
          tooltip={typeof item.tooltip === 'string' ? item.tooltip : undefined}
          tooltipDisabled={item.tooltipDisabled}
          className="border-0"
        >
          {item.icon}
          {item.label}
        </EditorButton>
      );
      if (!item.capability) return toggle;
      return (
        <FeatureGate
          key={item.id}
          capability={item.capability}
          mode={item.gateMode}
          reason={item.gateReason}
          actionLabel={item.gateActionLabel}
          onAction={item.gateOnAction}
          fallback={item.gateFallback}
          className={item.gateClassName}
        >
          {toggle}
        </FeatureGate>
      );
    }
    case 'custom':
      return <React.Fragment key={item.id}>{item.render()}</React.Fragment>;
    case 'menu': {
      const menu = (
        <div key={item.id}>
          {item.icon}
          {item.label}
          {item.children}
        </div>
      );
      if (!item.capability) return menu;
      return (
        <FeatureGate
          capability={item.capability}
          mode={item.gateMode}
          reason={item.gateReason}
          actionLabel={item.gateActionLabel}
          onAction={item.gateOnAction}
          fallback={item.gateFallback}
          className={item.gateClassName}
        >
          {menu}
        </FeatureGate>
      );
    }
    default:
      return null;
  }
}

/**
 * EditorToolbar — the toolbar bar of an editor.
 *
 * Replaces `WorkspaceToolbar`. Compound component with `.Left`, `.Center`,
 * `.Right`, `.Separator`, `.Group`, `.Button`, `.FileMenu`, `.Menubar`,
 * `.ProjectSelect` sub-components.
 *
 * Supports both slot-based composition and data-driven rendering via `groups`.
 *
 * @example
 * ```tsx
 * <EditorToolbar className="bg-sidebar border-b border-sidebar-border">
 *   <EditorToolbar.Left>
 *     <EditorToolbar.Group>
 *       <ProjectSwitcher ... />
 *       <EditorToolbar.Menubar menus={menus} />
 *     </EditorToolbar.Group>
 *   </EditorToolbar.Left>
 *   <EditorToolbar.Right>
 *     <ModelSwitcher />
 *     <EditorToolbar.Separator />
 *     <EditorToolbar.Button onClick={onSave}>Save</EditorToolbar.Button>
 *   </EditorToolbar.Right>
 * </EditorToolbar>
 * ```
 */
function ToolbarRoot({ children, groups, className }: EditorToolbarProps) {
  const content =
    groups && groups.length > 0
      ? groups.map((g) => (
          <ToolbarSection key={g.id} align={g.align}>
            <ToolbarGroupEl>{g.items.map(renderToolbarItem)}</ToolbarGroupEl>
          </ToolbarSection>
        ))
      : children;

  return (
    <div
      role="toolbar"
      className={cn(
        'min-h-[var(--toolbar-height)] flex items-center gap-[var(--control-gap)] px-[var(--panel-padding)] border-b-2 border-[var(--context-accent)] bg-muted text-[11px] shrink-0',
        className,
      )}
    >
      {content}
    </div>
  );
}

export const EditorToolbar = Object.assign(ToolbarRoot, {
  Left: (props: { children?: React.ReactNode; className?: string }) => (
    <ToolbarSection {...props} align="start" />
  ),
  Center: (props: { children?: React.ReactNode; className?: string }) => (
    <ToolbarSection {...props} align="center" />
  ),
  Right: (props: { children?: React.ReactNode; className?: string }) => (
    <ToolbarSection {...props} align="end" />
  ),
  Separator: ToolbarSeparator,
  Group: ToolbarGroupEl,
  Button: EditorButton,
  FileMenu: EditorFileMenu,
  Menubar: EditorMenubar,
  ProjectSelect: EditorProjectSelect,
});
