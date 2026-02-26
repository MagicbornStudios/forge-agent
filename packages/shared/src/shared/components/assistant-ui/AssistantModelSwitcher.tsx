'use client';

import * as React from 'react';
import { Bot, Check, ChevronsUpDown, ImageIcon, Sparkles, Wrench } from 'lucide-react';
import { cn } from '@forge/shared/lib/utils';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@forge/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@forge/ui/popover';

export type AssistantModelTier = 'free' | 'paid';

export type AssistantModelOption = {
  id: string;
  label: string;
  provider?: string;
  description?: string;
  tier?: AssistantModelTier;
  supportsTools?: boolean;
  supportsImages?: boolean;
  supportsResponsesV2?: boolean;
};

type AssistantModelSwitcherVariant = 'toolbar' | 'composer';

export interface AssistantModelSwitcherProps {
  value: string;
  options: AssistantModelOption[];
  onValueChange: (modelId: string) => void;
  variant?: AssistantModelSwitcherVariant;
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  showTierBadge?: boolean;
  showResponsesV2Badge?: boolean;
  showTierFilter?: boolean;
}

function TierBadge({ tier }: { tier: AssistantModelTier }) {
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

function normalizeModelLabel(option: AssistantModelOption) {
  const label = String(option.label || option.id || '').trim();
  return label || String(option.id || 'Unknown');
}

function uniqueProviders(options: AssistantModelOption[]) {
  const providers = new Set<string>();
  for (const model of options) {
    const provider = String(model.provider || '').trim();
    if (provider) providers.add(provider);
  }
  return ['all', ...Array.from(providers).sort((a, b) => a.localeCompare(b))];
}

export function AssistantModelSwitcher({
  value,
  options,
  onValueChange,
  variant = 'toolbar',
  title = 'Assistant UI model',
  loading = false,
  disabled = false,
  className,
  showTierBadge = true,
  showResponsesV2Badge = true,
  showTierFilter = true,
}: AssistantModelSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [toolsOnly, setToolsOnly] = React.useState(false);
  const [visionOnly, setVisionOnly] = React.useState(false);
  const [providerFilter, setProviderFilter] = React.useState('all');
  const [responsesV2Only, setResponsesV2Only] = React.useState(false);
  const [tierFilter, setTierFilter] = React.useState<'all' | AssistantModelTier>('all');

  const activeModel = React.useMemo(
    () => options.find((model) => model.id === value),
    [options, value],
  );
  const activeLabel = activeModel
    ? normalizeModelLabel(activeModel)
    : (value.split('/').pop() || value || 'Unknown');

  const providerFamilies = React.useMemo(() => uniqueProviders(options), [options]);
  const tierFamilies = React.useMemo(() => {
    const tiers = new Set<AssistantModelTier>();
    for (const model of options) {
      if (model.tier === 'free' || model.tier === 'paid') {
        tiers.add(model.tier);
      }
    }
    return [...tiers];
  }, [options]);
  const hasTierFilters = showTierFilter && tierFamilies.length > 1;

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return options.filter((model) => {
      if (providerFilter !== 'all' && model.provider !== providerFilter) return false;
      if (tierFilter !== 'all' && model.tier !== tierFilter) return false;
      if (toolsOnly && model.supportsTools !== true) return false;
      if (visionOnly && model.supportsImages !== true) return false;
      if (responsesV2Only && model.supportsResponsesV2 !== true) return false;

      if (!normalizedQuery) return true;
      const haystack = [
        model.label,
        model.id,
        model.provider,
        model.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [options, providerFilter, query, responsesV2Only, tierFilter, toolsOnly, visionOnly]);

  const activeTriggerLabel = activeModel?.provider
    ? `${activeModel.provider}: ${activeLabel}`
    : activeLabel;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant === 'composer' ? 'ghost' : 'outline'}
          size="sm"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            variant === 'composer'
              ? 'h-[var(--control-height-sm)] min-w-[11.5rem] rounded-md border border-border/70 bg-card/95 px-[var(--control-padding-x)] text-xs shadow-[var(--shadow-xs)]'
              : 'min-w-[220px] justify-between gap-[var(--control-gap)] text-xs text-foreground',
            'hover:bg-accent hover:text-accent-foreground',
            className,
          )}
        >
          {variant === 'composer' ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <Bot className="size-[var(--icon-size)] shrink-0 opacity-70" aria-hidden />
              <span className="truncate max-w-[9rem] font-medium">{activeTriggerLabel}</span>
              <ChevronsUpDown className="size-[var(--icon-size)] shrink-0 opacity-60" />
            </span>
          ) : (
            <>
              <span className="flex items-center gap-[var(--control-gap)] min-w-0">
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    loading ? 'bg-muted-foreground/60 animate-pulse' : 'bg-emerald-400',
                  )}
                />
                <Bot className="size-[var(--icon-size)] shrink-0 opacity-70" aria-hidden />
                <span className="truncate" title={title}>
                  {title}: {activeLabel}
                </span>
              </span>
              <ChevronsUpDown className="size-[var(--icon-size)] shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[26rem] min-w-[22rem] max-w-[90vw] overflow-hidden border-border/70 bg-popover p-0 shadow-[var(--shadow-xl)]"
        side={variant === 'composer' ? 'top' : 'bottom'}
        align="end"
        collisionPadding={12}
      >
        <div className="flex items-start justify-between gap-3 border-b bg-muted/40 px-[var(--panel-padding)] py-[var(--control-padding-y)]">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground">{title}</div>
            <div className="text-[10px] text-muted-foreground">
              Search models, then filter by capability or provider.
            </div>
          </div>
          <div className="min-w-0 text-right">
            <div className="text-[10px] uppercase text-muted-foreground">Active</div>
            <div className="truncate text-xs font-medium text-foreground max-w-[11rem]">{activeTriggerLabel}</div>
          </div>
        </div>

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
            '[&_[cmdk-item]]:py-[calc(var(--control-padding-y)+2px)]',
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
              onClick={() => setToolsOnly((current) => !current)}
              icon={<Wrench className="size-[var(--icon-size)]" aria-hidden />}
            >
              Tools
            </FilterChip>
            <FilterChip
              active={visionOnly}
              onClick={() => setVisionOnly((current) => !current)}
              icon={<ImageIcon className="size-[var(--icon-size)]" aria-hidden />}
            >
              Vision
            </FilterChip>
            <FilterChip
              active={responsesV2Only}
              onClick={() => setResponsesV2Only((current) => !current)}
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

          {hasTierFilters ? (
            <div className="flex gap-[var(--control-gap)] overflow-x-auto border-b px-[var(--panel-padding)] py-[var(--control-padding-y)]">
              <FilterChip
                active={tierFilter === 'all'}
                onClick={() => setTierFilter('all')}
              >
                All tiers
              </FilterChip>
              {tierFamilies.includes('free') ? (
                <FilterChip
                  active={tierFilter === 'free'}
                  onClick={() => setTierFilter('free')}
                >
                  Free
                </FilterChip>
              ) : null}
              {tierFamilies.includes('paid') ? (
                <FilterChip
                  active={tierFilter === 'paid'}
                  onClick={() => setTierFilter('paid')}
                >
                  Paid
                </FilterChip>
              ) : null}
            </div>
          ) : null}

          <CommandEmpty className="text-xs">No model found.</CommandEmpty>
          <CommandList className="max-h-[360px]">
            <CommandGroup heading="Models">
              {filteredOptions.map((model) => (
                <CommandItem
                  key={model.id}
                  value={`${model.label} ${model.id}`}
                  onSelect={() => {
                    onValueChange(model.id);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      'mr-2 size-[var(--icon-size)] shrink-0',
                      value === model.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{normalizeModelLabel(model)}</span>
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
                    {showTierBadge && model.tier ? <TierBadge tier={model.tier} /> : null}
                    {showResponsesV2Badge ? <CompatBadge value={model.supportsResponsesV2 ?? null} /> : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
