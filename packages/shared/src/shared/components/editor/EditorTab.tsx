'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { EditorTooltip } from './EditorTooltip';

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
  tooltip?: React.ReactNode;
  tooltipDisabled?: boolean;
  tooltipSide?: React.ComponentPropsWithoutRef<typeof EditorTooltip>['tooltipSide'];
  tooltipAlign?: React.ComponentPropsWithoutRef<typeof EditorTooltip>['tooltipAlign'];
  tooltipClassName?: string;
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
  tooltipSide,
  tooltipAlign,
  tooltipClassName,
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
        'relative group flex items-center gap-1.5 rounded-t-md border border-transparent px-3 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:shadow-sm',
        'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/70',
        'data-[state=active]:after:content-[\'\'] data-[state=active]:after:absolute data-[state=active]:after:inset-x-2 data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[color:var(--context-accent)] data-[state=active]:after:rounded-full',
        className,
      )}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <span className="truncate">{label}</span>
      {onClose && (
        <button
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
          className={cn(
            'ml-1 rounded p-0.5 text-muted-foreground/70 transition',
            'hover:text-foreground hover:bg-muted/70',
          )}
        >
          <span aria-hidden>x</span>
        </button>
      )}
    </div>
  );

  const hasTooltip = tooltip && !tooltipDisabled;
  if (!hasTooltip) return tab;
  return (
    <EditorTooltip
      tooltip={tooltip}
      tooltipSide={tooltipSide}
      tooltipAlign={tooltipAlign}
      tooltipClassName={tooltipClassName}
    >
      {tab}
    </EditorTooltip>
  );
}
