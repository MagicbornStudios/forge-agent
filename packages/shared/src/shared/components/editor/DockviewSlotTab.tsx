'use client';

import * as React from 'react';
import type { IDockviewPanelHeaderProps } from 'dockview';
import { cn } from '@forge/shared/lib/utils';
import { BookOpen, LayoutDashboard, ScanSearch, Wrench, X, type LucideIcon } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Label } from '@forge/ui/label';

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

export function DockviewSlotTab(
  props: IDockviewPanelHeaderProps & React.HTMLAttributes<HTMLDivElement>
) {
  const { api, containerApi, params, className, ...rest } = props;
  const slotId = (params?.slotId as string) ?? 'main';
  const iconKey = (params?.iconKey as string) ?? slotId;
  const titleOverride = params?.title as string | undefined;
  const displayTitle = titleOverride ?? api.title ?? slotId;
  const IconComponent = SLOT_ICON_MAP[iconKey] ?? SLOT_ICON_MAP.main;
  const isActive = api.isGroupActive;

  const handleClose = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      api.close();
    },
    [api]
  );

  return (
    <div
      className={cn(
        'dv-tab flex min-h-[var(--tab-height)] items-center gap-[var(--control-gap)] px-[var(--control-padding-x)] py-[var(--control-padding-y)]',
        'border-b border-border bg-card shrink-0 text-[11px] min-w-0',
        'cursor-pointer select-none transition-colors',
        'hover:bg-muted/50',
        isActive && 'dv-active-tab border-b-2 border-[var(--context-accent)] bg-card shadow-[var(--glow-panel-accent)]',
        className
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
          <IconComponent className="size-3" />
        </span>
      )}
      <Label className="font-semibold text-foreground truncate flex-1">{displayTitle}</Label>
      <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close panel" className="shrink-0 rounded p-[var(--control-padding-y)] text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm border-none">
        <X className="size-3 text-muted-foreground hover:text-foreground" />
      </Button>
    </div>
  );
}
