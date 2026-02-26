'use client';

import * as React from 'react';

/** @deprecated Use icon (React.ReactNode) instead. Kept for WorkspaceRailPanel/WorkspaceRail backward compat. */
export type DockLayoutSlotIconKey = string;
import type { IDockviewPanelHeaderProps } from 'dockview';
import { cn } from '@forge/shared/lib/utils';
import { LayoutDashboard, X } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Label } from '@forge/ui/label';

export function DockviewSlotTab(
  props: IDockviewPanelHeaderProps & React.HTMLAttributes<HTMLDivElement>
) {
  const { api, containerApi, params, className, ...rest } = props;
  const slotId = (params?.slotId as string) ?? 'main';
  const iconCandidate = params?.icon as unknown;
  const icon = React.isValidElement(iconCandidate) ? iconCandidate : null;
  const titleOverride = params?.title as string | undefined;
  const displayTitle = titleOverride ?? api.title ?? slotId;
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
      <span className="shrink-0 text-muted-foreground" aria-hidden>
        {icon ?? <LayoutDashboard className="size-[var(--icon-size)]" />}
      </span>
      <Label className="font-semibold text-foreground truncate flex-1">{displayTitle}</Label>
      <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close panel" className="shrink-0 rounded p-[var(--control-padding-y)] text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm border-none">
        <X className="size-[var(--icon-size)] text-muted-foreground hover:text-foreground" />
      </Button>
    </div>
  );
}
