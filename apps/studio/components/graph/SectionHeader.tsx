'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@forge/ui/tooltip';
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
      {actions.map((action) => {
        const button = (
          <Button
            key={action.id}
            variant={action.variant ?? 'ghost'}
            size="icon"
            className="h-6 w-6"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon}
          </Button>
        );

        if (action.tooltip) {
          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent>
                <p>{action.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        return button;
      })}
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
      <div className="flex items-center justify-between px-[var(--control-padding-x)] py-[var(--control-padding-y)]">
        <div className="flex items-center gap-[var(--control-gap)]">
          <div style={{ color: accentColor }}>{icon}</div>
          <span className={cn('text-xs font-medium', focusedEditor ? 'text-foreground' : 'text-muted-foreground')}>
            {title}
          </span>
          {badge && (
            <Badge variant={badge.variant ?? 'secondary'} className={cn('h-4 px-1.5 text-[10px]', badge.className)}>
              {badge.label}
            </Badge>
          )}
        </div>
        {toolbarActions.length > 0 && <SectionToolbar actions={toolbarActions} />}
      </div>

      {onSearchChange !== undefined && (
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 size-3 text-muted-foreground" />
            <Input
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-7 text-xs"
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
