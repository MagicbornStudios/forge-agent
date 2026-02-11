'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { cn } from '@forge/shared/lib/utils';

export interface SectionToolbarAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
}

function SectionToolbar({ actions, className }: { actions: SectionToolbarAction[]; className?: string }) {
  if (actions.length === 0) return null;
  return (
    <div className={cn('flex items-center gap-[var(--control-gap)]', className)}>
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant ?? 'ghost'}
          size="icon"
          title={action.tooltip}
          className="h-[var(--control-height-sm)] w-[var(--control-height-sm)]"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  iconColor?: string;
  /** Optional domain/context override so this section uses a different --context-accent (e.g. "dialogue", "character"). Wraps content in data-domain for contexts.css. */
  context?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  focusedEditor?: 'narrative' | 'storylet' | null;
  toolbarActions?: SectionToolbarAction[];
  className?: string;
}

export function SectionHeader({
  title,
  icon,
  iconColor,
  context: contextOverride,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search... ',
  badge,
  focusedEditor,
  toolbarActions = [],
  className,
}: SectionHeaderProps) {
  const accentColor =
    iconColor ??
    (focusedEditor === 'narrative'
      ? 'var(--status-info)'
      : focusedEditor === 'storylet'
        ? 'var(--graph-edge-choice-1)'
        : 'var(--context-accent)');

  const headerStyle = {
    borderBottomColor: accentColor,
    ...(focusedEditor && {
      backgroundColor: `color-mix(in oklab, ${accentColor} 10%, transparent)`,
    }),
  };

  const content = (
    <div className={cn('flex flex-col border-b', className)} style={headerStyle}>
      <div className="flex items-center justify-between px-[var(--panel-padding)] py-[var(--control-padding-y)]">
        <div className="flex items-center gap-[var(--control-gap)]">
          <span className="flex items-center [&_svg]:size-[var(--icon-size)]" style={{ color: accentColor }}>
            {icon}
          </span>
          <span className={cn('text-xs font-medium', focusedEditor ? 'text-foreground' : 'text-muted-foreground')}>
            {title}
          </span>
          {badge && (
            <Badge
              variant={badge.variant ?? 'secondary'}
              className={cn('text-[10px] uppercase tracking-wide', badge.className)}
            >
              {badge.label}
            </Badge>
          )}
        </div>
        {toolbarActions.length > 0 && <SectionToolbar actions={toolbarActions} />}
      </div>

      {onSearchChange !== undefined && (
        <div className="px-[var(--panel-padding)] pb-[var(--control-padding-y)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-[var(--control-padding-x)] top-1/2 size-[var(--icon-size)] -translate-y-1/2 text-muted-foreground/80" />
            <Input
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-[var(--control-height-sm)] pl-[calc(var(--control-padding-x)+var(--icon-size)+var(--control-gap))] text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );

  if (contextOverride) {
    return <div data-domain={contextOverride}>{content}</div>;
  }
  return content;
}
