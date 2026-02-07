'use client';

import * as React from 'react';
import type { IDockviewPanelHeaderProps } from 'dockview';
import { cn } from '@forge/shared/lib/utils';
import {
  BookOpen,
  LayoutDashboard,
  ScanSearch,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

const SLOT_ICON_MAP: Record<string, LucideIcon> = {
  library: BookOpen,
  left: BookOpen,
  main: LayoutDashboard,
  inspector: ScanSearch,
  right: ScanSearch,
  workbench: Wrench,
  bottom: Wrench,
};

export type DockLayoutSlotIconKey = keyof typeof SLOT_ICON_MAP;

export function DockviewSlotTab(props: IDockviewPanelHeaderProps) {
  const { api, params, tabLocation, ...rest } = props;
  const slotId = (params?.slotId as string) ?? 'main';
  const iconKey = (params?.iconKey as string) ?? slotId;
  const titleOverride = params?.title as string | undefined;
  const displayTitle = titleOverride ?? api.title ?? slotId;
  const IconComponent = SLOT_ICON_MAP[iconKey] ?? SLOT_ICON_MAP.main;
  const isActive = api.isGroupActive;

  const handleClose = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      api.close();
    },
    [api]
  );

  return (
    <div
      className={cn(
        'dv-tab flex min-h-[var(--tab-height)] items-center gap-[var(--control-gap)] px-[var(--panel-padding)] py-[var(--control-padding-y)]',
        'border-b border-border bg-card shrink-0 text-[11px] min-w-0',
        'cursor-pointer select-none transition-colors',
        'hover:bg-muted/50',
        isActive && 'dv-active-tab border-b-2 border-[var(--context-accent)] bg-card shadow-[var(--glow-panel-accent)]'
      )}
      data-slot-id={slotId}
      data-active={isActive}
      role="tab"
      tabIndex={0}
      aria-selected={isActive}
      {...rest}
    >
      {IconComponent && (
        <span className="shrink-0 text-muted-foreground" aria-hidden>
          <IconComponent className="size-4" />
        </span>
      )}
      <span className="font-semibold text-foreground truncate flex-1">{displayTitle}</span>
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        aria-label="Close panel"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 2l8 8M10 2L2 10" />
        </svg>
      </button>
    </div>
  );
}
