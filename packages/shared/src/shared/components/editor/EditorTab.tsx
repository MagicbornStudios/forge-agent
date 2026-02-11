'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Label } from '@forge/ui/label';
import { cn } from '@forge/shared/lib/utils';

export interface EditorTabProps {
  label: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  domain?: string;
  onSelect?: () => void;
  onClose?: () => void;
  closeLabel?: string;
  closeTooltip?: React.ReactNode;
  closeTooltipDisabled?: boolean;
  className?: string;
  /** Native title only */
  tooltip?: string;
  tooltipDisabled?: boolean;
}

export function EditorTab({
  label,
  isActive,
  disabled,
  domain,
  onSelect,
  onClose,
  closeLabel,
  closeTooltip,
  closeTooltipDisabled,
  className,
  tooltip,
  tooltipDisabled,
}: EditorTabProps) {
  const handleSelect = React.useCallback(() => {
    if (!disabled) onSelect?.();
  }, [disabled, onSelect]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect?.();
      }
    },
    [disabled, onSelect],
  );

  const tab = (
    <div
      role="tab"
      aria-selected={!!isActive}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      data-state={isActive ? 'active' : 'inactive'}
      data-domain={domain}
      className={cn(
        'relative group flex min-h-[var(--tab-height)] min-w-0 items-center gap-[var(--control-gap)] rounded-t-md border border-transparent px-[var(--control-padding-x)] py-[var(--control-padding-y)] text-[11px] font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:shadow-[var(--shadow-sm)]',
        'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/70',
        'data-[state=active]:after:content-[\'\'] data-[state=active]:after:absolute data-[state=active]:after:inset-x-[var(--control-padding-x)] data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[color:var(--context-accent)] data-[state=active]:after:rounded-full',
        '[&_svg]:w-[var(--icon-size)] [&_svg]:h-[var(--icon-size)] [&_svg]:shrink-0',
        className,
      )}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <Label className="min-w-0 flex-1 truncate font-semibold text-inherit">{label}</Label>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={closeLabel ?? 'Close tab'}
          title={
            closeTooltipDisabled
              ? undefined
              : typeof closeTooltip === 'string'
                ? closeTooltip
                : 'Close tab'
          }
          className="shrink-0 rounded border-none p-[var(--control-padding-y)] text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );

  return tab;
}
