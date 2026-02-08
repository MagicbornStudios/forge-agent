'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@forge/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@forge/ui/popover';
import { cn } from '@forge/shared/lib/utils';
import { EditorButton } from '../EditorButton';

export interface EditorProjectOption {
  value: string;
  label: string;
}

export interface EditorProjectSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: EditorProjectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  tooltip?: React.ReactNode;
}

export function EditorProjectSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select project',
  disabled,
  className,
  tooltip,
}: EditorProjectSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((opt) => opt.value === value);
  const searchPlaceholder = placeholder.toLowerCase().startsWith('select ')
    ? `Search ${placeholder.slice(7)}`
    : `Search ${placeholder.toLowerCase()}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <EditorButton
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          tooltip={tooltip}
          className={cn('min-w-[180px] justify-between border-0', className)}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 size-3 shrink-0 opacity-50" />
        </EditorButton>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>No results.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onValueChange?.(opt.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('mr-2 size-3', value === opt.value ? 'opacity-100' : 'opacity-0')}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
