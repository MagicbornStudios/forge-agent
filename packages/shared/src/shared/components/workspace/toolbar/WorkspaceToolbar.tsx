'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { Separator } from '@forge/ui/separator';
import type { ToolbarGroup, ToolbarItem } from '@forge/shared/workspace';
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
    case 'button':
      return (
        <WorkspaceButton
          key={item.id}
          variant={item.variant ?? 'outline'}
          size={item.size ?? 'sm'}
          disabled={item.disabled}
          onClick={item.onClick}
          tooltip={item.tooltip}
          tooltipDisabled={item.tooltipDisabled}
          tootlipDisabled={item.tootlipDisabled}
        >
          {item.icon}
          {item.label}
        </WorkspaceButton>
      );
    case 'toggle':
      return (
        <WorkspaceButton
          key={item.id}
          variant="outline"
          size="sm"
          onClick={() => item.onToggle(!item.pressed)}
          data-state={item.pressed ? 'on' : 'off'}
          tooltip={item.tooltip}
          tooltipDisabled={item.tooltipDisabled}
          tootlipDisabled={item.tootlipDisabled}
        >
          {item.icon}
          {item.label}
        </WorkspaceButton>
      );
    case 'custom':
      return <React.Fragment key={item.id}>{item.render()}</React.Fragment>;
    case 'menu':
      return (
        <div key={item.id}>
          {item.icon}
          {item.label}
          {item.children}
        </div>
      );
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
