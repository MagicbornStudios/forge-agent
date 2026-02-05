'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { Separator } from '@forge/ui/separator';
import type { ToolbarGroup, ToolbarItem } from '@forge/shared/workspace';
import { FeatureGate } from '../../gating/FeatureGate';
import { WorkspaceButton } from '../controls/WorkspaceButton';
import { WorkspaceFileMenu } from './WorkspaceFileMenu';
import { WorkspaceMenubar } from './WorkspaceMenubar';
import { WorkspaceProjectSelect } from './WorkspaceProjectSelect';

export interface WorkspaceToolbarProps {
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
        'flex items-center gap-2',
        align === 'center' && 'flex-none justify-center',
        align === 'start' && 'flex-1 justify-start',
        align === 'end' && 'flex-1 justify-end',
        className
      )}
    >
      {children}
    </div>
  );
}

function ToolbarSeparator() {
  return <Separator orientation="vertical" className="h-5" />;
}

function ToolbarGroupEl({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-1', className)}>{children}</div>;
}

function renderToolbarItem(item: ToolbarItem) {
  switch (item.type) {
    case 'button': {
      const button = (
        <WorkspaceButton
          key={item.id}
          variant={item.variant ?? 'outline'}
          size={item.size ?? 'sm'}
          disabled={item.disabled}
          onClick={item.onClick}
          tooltip={item.tooltip}
          tooltipDisabled={item.tooltipDisabled}
        >
          {item.icon}
          {item.label}
        </WorkspaceButton>
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
        <WorkspaceButton
          key={item.id}
          variant="outline"
          size="sm"
          onClick={() => item.onToggle(!item.pressed)}
          data-state={item.pressed ? 'on' : 'off'}
          tooltip={item.tooltip}
          tooltipDisabled={item.tooltipDisabled}
        >
          {item.icon}
          {item.label}
        </WorkspaceButton>
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
    case 'menu':
      {
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

function ToolbarRoot({ children, groups, className }: WorkspaceToolbarProps) {
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
        'min-h-10 flex items-center gap-3 px-4 border-b border-border bg-muted',
        className
      )}
    >
      {content}
    </div>
  );
}

export const WorkspaceToolbar = Object.assign(ToolbarRoot, {
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
  Button: WorkspaceButton,
  FileMenu: WorkspaceFileMenu,
  Menubar: WorkspaceMenubar,
  ProjectSelect: WorkspaceProjectSelect,
});
