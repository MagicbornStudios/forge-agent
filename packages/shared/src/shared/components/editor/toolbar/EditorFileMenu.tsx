'use client';

import * as React from 'react';
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
          <EditorButton variant="ghost" size="sm" tooltip={tooltip}>
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
              className={item.variant === 'destructive' ? 'text-destructive' : undefined}
            >
              {item.label}
              {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
