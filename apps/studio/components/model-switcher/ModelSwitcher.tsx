'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Check, ChevronsUpDown } from 'lucide-react';
import { useModelRouterStore } from '@/lib/model-router/store';
import { useSettingsStore } from '@/lib/settings/store';
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
import { Switch } from '@forge/ui/switch';
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

function CompatBadge({ value }: { value: boolean | null | undefined }) {
  if (value === true) {
    return (
      <Badge variant="outline" className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded shrink-0">
        v2
      </Badge>
    );
  }
  if (value === false) {
    return (
      <Badge variant="outline" className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded shrink-0">
        v3
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded shrink-0">
      ?
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
  const responsesCompatOnlySetting = useSettingsStore((s) => s.getSettingValue('ai.responsesCompatOnly')) as
    | boolean
    | undefined;
  const setSetting = useSettingsStore((s) => s.setSetting);

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
  const baseModels = FREE_ONLY ? freeModels : [...freeModels, ...paidModels];
  const responsesCompatOnly = responsesCompatOnlySetting !== false;
  const displayModels = responsesCompatOnly
    ? baseModels.filter((m) => m.supportsResponsesV2 === true)
    : baseModels;
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
            'min-w-[220px] justify-between gap-[var(--control-gap)] text-xs text-foreground',
            'hover:bg-accent hover:text-accent-foreground',
          )}
        >
          <span className="flex items-center gap-[var(--control-gap)] min-w-0">
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                isLoading ? 'bg-muted-foreground/60 animate-pulse' : 'bg-emerald-400',
              )}
            />
            <Bot className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{triggerLabel}</span>
          </span>
          <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
        </EditorButton>
      </PopoverTrigger>
      <PopoverContent className="p-0 min-w-[20rem] w-80" align="end">
        {registry.length === 0 && !isLoading ? (
          <div className="px-[var(--panel-padding)] py-4 text-xs text-muted-foreground">
            Models load from OpenRouter when available. Check API key if empty.
          </div>
        ) : (
          <Command className="rounded-lg border-0" shouldFilter={true}>
            <CommandInput placeholder="Search models..." className="h-9 text-xs" />
            <div className="flex items-center justify-between gap-[var(--control-gap)] px-[var(--panel-padding)] py-[var(--control-padding-y)] text-xs border-b">
              <div className="flex flex-col">
                <span className="font-medium">Responses v2 only</span>
                <span className="text-[10px] text-muted-foreground">
                  Required for CopilotKit BuiltInAgent
                </span>
              </div>
              <Switch
                checked={responsesCompatOnly}
                onCheckedChange={(checked) => setSetting('app', 'ai.responsesCompatOnly', checked)}
              />
            </div>
            {responsesCompatOnly && displayModels.length === 0 && registry.length > 0 && (
              <div className="px-[var(--panel-padding)] py-[var(--control-padding-y)] text-[11px] text-muted-foreground border-b">
                No responses-v2 compatible models detected in the current list. CopilotKit will
                fall back to a compatible model automatically.
              </div>
            )}
            <CommandEmpty className="text-xs">No model found.</CommandEmpty>
            <CommandList>
              <CommandGroup heading="Mode">
                <CommandItem
                  value="auto primary fallbacks"
                  onSelect={() => setMode('auto')}
                  className="text-xs"
                >
                  <Check className={cn('mr-2 size-3 shrink-0', mode === 'auto' ? 'opacity-100' : 'opacity-0')} />
                  Auto (primary + fallbacks)
                </CommandItem>
                <CommandItem
                  value="manual pick one"
                  onSelect={() => setMode('manual')}
                  className="text-xs"
                >
                  <Check className={cn('mr-2 size-3 shrink-0', mode === 'manual' ? 'opacity-100' : 'opacity-0')} />
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
                        className={cn('mr-2 size-3 shrink-0', enabledModelIds.includes(model.id) ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="flex-1 truncate">{model.label}</span>
                      <div className="flex items-center gap-[var(--control-gap)]">
                        {showTierBadge && <TierBadge tier={model.tier} />}
                        <CompatBadge value={model.supportsResponsesV2 ?? null} />
                      </div>
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
                        className={cn('mr-2 size-3 shrink-0', activeModelId === model.id ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="flex-1 truncate">{model.label}</span>
                      <div className="flex items-center gap-[var(--control-gap)]">
                        {showTierBadge && <TierBadge tier={model.tier} />}
                        <CompatBadge value={model.supportsResponsesV2 ?? null} />
                      </div>
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
