'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@forge/ui/dropdown-menu';
import { EditorButton } from '../EditorButton';

export type EditorFileMenuItem =
  | {
      id: string;
      label: string;
      icon?: React.ReactNode;
      onSelect?: () => void;
      disabled?: boolean;
      shortcut?: string;
      variant?: 'default' | 'destructive';
    }
  | { id: string; type: 'separator' };

export interface EditorFileMenuProps {
  items: EditorFileMenuItem[];
  trigger?: React.ReactNode;
  tooltip?: React.ReactNode;
}

function isSeparator(item: EditorFileMenuItem): item is { id: string; type: 'separator' } {
  return 'type' in item && item.type === 'separator';
}

export function EditorFileMenu({
  items,
  trigger,
  tooltip = 'File menu',
}: EditorFileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <EditorButton variant="outline" size="sm" tooltip={tooltip} className="border-0">
            File
          </EditorButton>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) =>
          isSeparator(item) ? (
            <DropdownMenuSeparator key={item.id} />
          ) : (
            <DropdownMenuItem
              key={item.id}
              disabled={item.disabled}
              onSelect={() => item.onSelect?.()}
              className={cn(
                'flex items-center gap-[var(--control-gap)]',
                item.variant === 'destructive' && 'text-destructive'
              )}
            >
              {item.icon != null && (
                <span className="flex shrink-0 size-3 [&>svg]:size-3">{item.icon}</span>
              )}
              {item.label}
              {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
