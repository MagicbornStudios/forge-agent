'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Check, ChevronsUpDown } from 'lucide-react';
import { useModelRouterStore } from '@/lib/model-router/store';
import { FREE_ONLY } from '@/lib/model-router/registry';
import type { ModelDef, SelectionMode } from '@/lib/model-router/types';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@forge/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@forge/ui/popover';
import { Badge } from '@forge/ui/badge';
import { EditorButton } from '@forge/shared';

// ---------------------------------------------------------------------------
// Tier badge
// ---------------------------------------------------------------------------

function TierBadge({ tier }: { tier: 'free' | 'paid' }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-medium uppercase px-1.5 py-0.5 rounded shrink-0',
        tier === 'free'
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-amber-500/15 text-amber-300',
      )}
    >
      {tier}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ModelSwitcher() {
  const [open, setOpen] = useState(false);
  const {
    registry,
    mode,
    activeModelId,
    enabledModelIds,
    fallbackIds,
    setMode,
    setManualModel,
    toggleModel,
    fetchSettings,
    isLoading,
  } = useModelRouterStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const activeModel = useMemo(
    () => registry.find((m) => m.id === activeModelId),
    [registry, activeModelId],
  );
  const activeLabel = activeModel?.label ?? activeModelId.split('/').pop() ?? 'Unknown';
  const fallbackLabel =
    fallbackIds.length > 0 ? ` +${fallbackIds.length} fallback${fallbackIds.length === 1 ? '' : 's'}` : '';
  const triggerLabel = mode === 'auto' ? `Auto: ${activeLabel}${fallbackLabel}` : activeLabel;

  const freeModels = useMemo(() => registry.filter((m) => m.tier === 'free'), [registry]);
  const paidModels = useMemo(() => registry.filter((m) => m.tier === 'paid'), [registry]);
  const displayModels = FREE_ONLY ? freeModels : [...freeModels, ...paidModels];
  const showTierBadge = !FREE_ONLY;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <EditorButton
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          tooltip="Model routing"
          className={cn(
            'min-w-[220px] justify-between gap-2 text-xs text-foreground',
            'hover:bg-accent hover:text-accent-foreground',
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                isLoading ? 'bg-muted-foreground/60 animate-pulse' : 'bg-emerald-400',
              )}
            />
            <Bot className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{triggerLabel}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </EditorButton>
      </PopoverTrigger>
      <PopoverContent className="p-0 min-w-[20rem] w-80" align="end">
        {registry.length === 0 && !isLoading ? (
          <div className="px-3 py-4 text-xs text-muted-foreground">
            Models load from OpenRouter when available. Check API key if empty.
          </div>
        ) : (
          <Command className="rounded-lg border-0" shouldFilter={true}>
            <CommandInput placeholder="Search models..." className="h-9 text-xs" />
            <CommandEmpty className="text-xs">No model found.</CommandEmpty>
            <CommandList>
              <CommandGroup heading="Mode">
                <CommandItem
                  value="auto primary fallbacks"
                  onSelect={() => setMode('auto')}
                  className="text-xs"
                >
                  <Check className={cn('mr-2 h-4 w-4 shrink-0', mode === 'auto' ? 'opacity-100' : 'opacity-0')} />
                  Auto (primary + fallbacks)
                </CommandItem>
                <CommandItem
                  value="manual pick one"
                  onSelect={() => setMode('manual')}
                  className="text-xs"
                >
                  <Check className={cn('mr-2 h-4 w-4 shrink-0', mode === 'manual' ? 'opacity-100' : 'opacity-0')} />
                  Manual (pick one)
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              {mode === 'auto' ? (
                <CommandGroup heading="Enabled models">
                  {displayModels.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={`${model.label} ${model.id}`}
                      onSelect={() => toggleModel(model.id)}
                      className="text-xs"
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4 shrink-0', enabledModelIds.includes(model.id) ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="flex-1 truncate">{model.label}</span>
                      {showTierBadge && <TierBadge tier={model.tier} />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandGroup heading="Pick model">
                  {displayModels.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={`${model.label} ${model.id}`}
                      onSelect={() => {
                        setManualModel(model.id);
                        setOpen(false);
                      }}
                      className="text-xs"
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4 shrink-0', activeModelId === model.id ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="flex-1 truncate">{model.label}</span>
                      {showTierBadge && <TierBadge tier={model.tier} />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
