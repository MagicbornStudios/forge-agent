'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Check,
  ChevronsUpDown,
  ImageIcon,
  Loader2,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useModelRouterStore } from '@/lib/model-router/store';
import { useSettingsStore } from '@/lib/settings/store';
import { FREE_ONLY } from '@/lib/model-router/registry';
import type { ModelDef, ModelProviderId } from '@/lib/model-router/types';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@forge/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@forge/ui/popover';
import { Badge } from '@forge/ui/badge';
import { Switch } from '@forge/ui/switch';
import { Button } from '@forge/ui/button';
import { EditorButton } from '@forge/shared';
import { CAPABILITIES, useEntitlements } from '@forge/shared/entitlements';
import { SettingsService } from '@/lib/api-client';
import { clientLogger } from '@/lib/logger-client';

const PROVIDER_LABELS: Record<ModelProviderId, string> = {
  copilot: 'Copilot model',
  assistantUi: 'Assistant UI model',
};

type ModelSwitcherVariant = 'toolbar' | 'composer';

function TierBadge({ tier }: { tier: 'free' | 'paid' }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-medium uppercase shrink-0',
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
      <Badge variant="outline" className="text-[10px] font-medium uppercase shrink-0">
        v2
      </Badge>
    );
  }
  if (value === false) {
    return (
      <Badge variant="outline" className="text-[10px] font-medium uppercase shrink-0">
        v3
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] font-medium uppercase shrink-0">
      ?
    </Badge>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  icon,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'outline'}
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-[var(--control-height-sm)] rounded-md border-border/60 bg-background/70 px-[var(--control-padding-x)] text-[11px] shadow-[var(--shadow-xs)]',
        active && 'border-border bg-accent text-accent-foreground',
        !active && 'text-muted-foreground hover:bg-accent/70 hover:text-foreground',
      )}
    >
      {icon}
      {children}
    </Button>
  );
}

export interface ModelSwitcherProps {
  /** Which chat this switcher controls (copilot or assistantUi). */
  provider: ModelProviderId;
  /** Placement variant. */
  variant?: ModelSwitcherVariant;
}

export function ModelSwitcher({ provider, variant = 'toolbar' }: ModelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [toolsOnly, setToolsOnly] = useState(false);
  const [visionOnly, setVisionOnly] = useState(false);
  const [providerFilter, setProviderFilter] = useState('all');
  const [responsesV2Filter, setResponsesV2Filter] = useState(false);
  const {
    registry,
    copilotModelId,
    assistantUiModelId,
    fetchSettings,
    setModelId,
    isLoading,
  } = useModelRouterStore();
  const entitlements = useEntitlements();
  const canUsePaidModels = entitlements.has(CAPABILITIES.STUDIO_MODELS_PAID);

  const responsesCompatOnlySetting = useSettingsStore((s) =>
    s.getSettingValue('ai.responsesCompatOnly'),
  ) as boolean | undefined;
  const setSetting = useSettingsStore((s) => s.setSetting);
  const getOverridesForScope = useSettingsStore((s) => s.getOverridesForScope);

  const currentModelId = provider === 'copilot' ? copilotModelId : assistantUiModelId;
  const responsesCompatOnly = responsesCompatOnlySetting !== false;
  const forceCopilotResponsesV2 = provider === 'copilot' && responsesCompatOnly;

  useEffect(() => {
    if (registry.length > 0 || isLoading) return;
    void fetchSettings();
  }, [fetchSettings, isLoading, registry.length]);

  const activeModel = useMemo(
    () => registry.find((m) => m.id === currentModelId),
    [registry, currentModelId],
  );
  const activeLabel = activeModel?.label ?? currentModelId.split('/').pop() ?? 'Unknown';

  const freeModels = useMemo(() => registry.filter((m) => m.tier === 'free'), [registry]);
  const paidModels = useMemo(() => registry.filter((m) => m.tier === 'paid'), [registry]);

  const selectableModels = useMemo(() => {
    if (FREE_ONLY) return freeModels;
    return canUsePaidModels ? [...freeModels, ...paidModels] : freeModels;
  }, [canUsePaidModels, freeModels, paidModels]);

  const lockedPaidModels = useMemo(() => {
    if (FREE_ONLY || canUsePaidModels) return [];
    return paidModels;
  }, [canUsePaidModels, paidModels]);

  const providerFamilies = useMemo(() => {
    const providers = new Set<string>();
    for (const model of registry) {
      if (model.provider) providers.add(model.provider);
    }
    return ['all', ...Array.from(providers).sort((a, b) => a.localeCompare(b))];
  }, [registry]);

  const applyFilters = useCallback(
    (models: ModelDef[], options?: { includeForcedResponsesV2?: boolean }) => {
      const normalizedQuery = query.trim().toLowerCase();
      const includeForcedResponsesV2 = options?.includeForcedResponsesV2 ?? true;

      return models.filter((model) => {
        if (providerFilter !== 'all' && model.provider !== providerFilter) return false;
        if (toolsOnly && !model.supportsTools) return false;
        if (visionOnly && !model.supportsImages) return false;
        if (responsesV2Filter && model.supportsResponsesV2 !== true) return false;
        if (includeForcedResponsesV2 && forceCopilotResponsesV2 && model.supportsResponsesV2 !== true) {
          return false;
        }
        if (!normalizedQuery) return true;

        const searchHaystack = `${model.label} ${model.id} ${model.provider ?? ''} ${model.description ?? ''}`.toLowerCase();
        return searchHaystack.includes(normalizedQuery);
      });
    },
    [forceCopilotResponsesV2, providerFilter, query, responsesV2Filter, toolsOnly, visionOnly],
  );

  const filteredSelectableModels = useMemo(
    () => applyFilters(selectableModels),
    [applyFilters, selectableModels],
  );
  const filteredLockedPaidModels = useMemo(
    () => applyFilters(lockedPaidModels, { includeForcedResponsesV2: false }),
    [applyFilters, lockedPaidModels],
  );

  const showTierBadge = !FREE_ONLY;

  const handleSelect = (modelId: string) => {
    void setModelId(provider, modelId);
    setOpen(false);
  };

  const persistResponsesCompatOnlySetting = useCallback(
    async (checked: boolean) => {
      setSetting('app', 'ai.responsesCompatOnly', checked);
      try {
        await SettingsService.postApiSettings({
          scope: 'app',
          scopeId: null,
          settings: getOverridesForScope('app'),
        });
      } catch (err) {
        clientLogger.error(
          'Failed to persist ai.responsesCompatOnly',
          { err: err instanceof Error ? err.message : String(err) },
          'model-switcher',
        );
      }
    },
    [getOverridesForScope, setSetting],
  );

  const popoverTitle = PROVIDER_LABELS[provider];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <EditorButton
          variant={variant === 'composer' ? 'ghost' : 'outline'}
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn(
            variant === 'composer'
              ? 'h-[var(--control-height-sm)] min-w-[11.5rem] rounded-md border border-border/70 bg-card/95 px-[var(--control-padding-x)] text-xs shadow-[var(--shadow-xs)]'
              : 'min-w-[220px] justify-between gap-[var(--control-gap)] text-xs text-foreground',
            'hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {variant === 'composer' ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <Bot className="size-[var(--icon-size)] shrink-0 opacity-70" aria-hidden />
              <span className="truncate max-w-[8.5rem] font-medium">{activeLabel}</span>
              <ChevronsUpDown className="size-[var(--icon-size)] shrink-0 opacity-60" />
            </span>
          ) : (
            <>
              <span className="flex items-center gap-[var(--control-gap)] min-w-0">
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    isLoading ? 'bg-muted-foreground/60 animate-pulse' : 'bg-emerald-400',
                  )}
                />
                <Bot className="size-[var(--icon-size)] shrink-0 opacity-70" aria-hidden />
                <span className="truncate" title={PROVIDER_LABELS[provider]}>
                  {PROVIDER_LABELS[provider]}: {activeLabel}
                </span>
              </span>
              <ChevronsUpDown className="size-[var(--icon-size)] shrink-0 opacity-50" />
            </>
          )}
        </EditorButton>
      </PopoverTrigger>

      <PopoverContent
        className="w-[26rem] min-w-[22rem] max-w-[90vw] overflow-hidden border-border/70 bg-popover p-0 shadow-[var(--shadow-xl)]"
        align="end"
        portalled={variant !== 'composer'}
      >
        <div className="flex items-start justify-between gap-3 border-b bg-muted/40 px-[var(--panel-padding)] py-[var(--control-padding-y)]">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground">{popoverTitle}</div>
            <div className="text-[10px] text-muted-foreground">
              Search models, then filter by capability or provider.
            </div>
          </div>
          <div className="min-w-0 text-right">
            <div className="text-[10px] uppercase text-muted-foreground">Active</div>
            <div className="truncate text-xs font-medium text-foreground max-w-[11rem]">{activeLabel}</div>
            {isLoading ? (
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Loader2 className="size-[var(--icon-size)] animate-spin" aria-hidden />
                Syncing
              </div>
            ) : null}
          </div>
        </div>
        {registry.length === 0 && !isLoading ? (
          <div className="px-[var(--panel-padding)] py-4 text-xs text-muted-foreground">
            Models load from OpenRouter when available. Check API key if empty.
          </div>
        ) : (
            <Command
              className={cn(
                'rounded-none border-0',
                '[&_[cmdk-input-wrapper]]:mx-[var(--panel-padding)]',
                '[&_[cmdk-input-wrapper]]:my-[var(--control-padding-y)]',
                '[&_[cmdk-input-wrapper]]:rounded-md',
                '[&_[cmdk-input-wrapper]]:border',
                '[&_[cmdk-input-wrapper]]:border-border/60',
                '[&_[cmdk-input-wrapper]]:bg-card/90',
                '[&_[cmdk-input-wrapper]]:px-[var(--control-padding-x)]',
                '[&_[cmdk-input-wrapper]]:py-[var(--control-padding-y)]',
                '[&_[cmdk-input-wrapper]_svg]:opacity-70',
                '[&_[cmdk-input]]:h-[var(--control-height-sm)]',
                '[&_[cmdk-input]]:text-xs',
              '[&_[cmdk-group-heading]]:px-[var(--panel-padding)]',
              '[&_[cmdk-group-heading]]:text-[10px]',
              '[&_[cmdk-group-heading]]:uppercase',
              '[&_[cmdk-group-heading]]:tracking-wide',
              '[&_[cmdk-item]]:px-[var(--panel-padding)]',
              '[&_[cmdk-item]]:py-[calc(var(--control-padding-y)+2px)]'
            )}
            shouldFilter={false}
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search models by name, id, provider..."
              className="text-xs"
            />

            <div className="flex gap-[var(--control-gap)] overflow-x-auto border-b px-[var(--panel-padding)] py-[var(--control-padding-y)]">
              <FilterChip
                active={toolsOnly}
                onClick={() => setToolsOnly((v) => !v)}
                icon={<Wrench className="size-[var(--icon-size)]" aria-hidden />}
              >
                Tools
              </FilterChip>
              <FilterChip
                active={visionOnly}
                onClick={() => setVisionOnly((v) => !v)}
                icon={<ImageIcon className="size-[var(--icon-size)]" aria-hidden />}
              >
                Vision
              </FilterChip>
              <FilterChip
                active={responsesV2Filter}
                onClick={() => setResponsesV2Filter((v) => !v)}
                disabled={forceCopilotResponsesV2}
                icon={<Sparkles className="size-[var(--icon-size)]" aria-hidden />}
              >
                Responses v2
              </FilterChip>
            </div>

            <div className="flex gap-[var(--control-gap)] overflow-x-auto border-b px-[var(--panel-padding)] py-[var(--control-padding-y)]">
              {providerFamilies.map((family) => (
                <FilterChip
                  key={family}
                  active={providerFilter === family}
                  onClick={() => setProviderFilter(family)}
                >
                  {family === 'all' ? 'All' : family}
                </FilterChip>
              ))}
            </div>

            {provider === 'copilot' && (
              <div className="flex items-center justify-between gap-[var(--control-gap)] border-b px-[var(--panel-padding)] py-[var(--control-padding-y)] text-xs bg-muted/30">
                <div className="flex flex-col">
                  <span className="font-medium">Responses v2 only</span>
                  <span className="text-[10px] text-muted-foreground">
                    Required for CopilotKit BuiltInAgent
                  </span>
                </div>
                <Switch
                  checked={responsesCompatOnly}
                  onCheckedChange={(checked) => {
                    void persistResponsesCompatOnlySetting(checked);
                  }}
                />
              </div>
            )}

            {forceCopilotResponsesV2 && filteredSelectableModels.length === 0 && registry.length > 0 && (
              <div className="border-b px-[var(--panel-padding)] py-[var(--control-padding-y)] text-[11px] text-muted-foreground">
                No responses-v2 compatible models in the selectable list.
              </div>
            )}

            <CommandEmpty className="text-xs">No model found.</CommandEmpty>
            <CommandList className="max-h-[360px]">
              <CommandGroup heading="Models">
                {filteredSelectableModels.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={`${model.label} ${model.id}`}
                    onSelect={() => handleSelect(model.id)}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        'mr-2 size-[var(--icon-size)] shrink-0',
                        currentModelId === model.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{model.label}</span>
                      <span className="truncate text-[10px] text-muted-foreground">{model.id}</span>
                    </span>
                    <div className="ml-2 flex items-center gap-[var(--control-gap)]">
                      {model.provider ? (
                        <Badge
                          variant="outline"
                          className="px-[calc(var(--badge-padding-x)+1px)] py-[calc(var(--badge-padding-y)+1px)] text-[10px] uppercase"
                        >
                          {model.provider}
                        </Badge>
                      ) : null}
                      {showTierBadge && <TierBadge tier={model.tier} />}
                      {provider === 'copilot' && <CompatBadge value={model.supportsResponsesV2 ?? null} />}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              {filteredLockedPaidModels.length > 0 && (
                <CommandGroup heading="Upgrade for best models">
                  {filteredLockedPaidModels.map((model) => (
                    <CommandItem key={model.id} value={model.id} disabled className="text-xs opacity-70">
                      <span className="mr-2 inline-flex size-3" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{model.label}</span>
                        <span className="truncate text-[10px] text-muted-foreground">{model.id}</span>
                      </span>
                      <div className="ml-2 flex items-center gap-[var(--control-gap)]">
                        {model.provider ? (
                          <Badge
                            variant="outline"
                            className="px-[calc(var(--badge-padding-x)+1px)] py-[calc(var(--badge-padding-y)+1px)] text-[10px] uppercase"
                          >
                            {model.provider}
                          </Badge>
                        ) : null}
                        <TierBadge tier="paid" />
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
