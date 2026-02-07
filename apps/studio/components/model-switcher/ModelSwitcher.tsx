'use client';

import React, { useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useModelRouterStore } from '@/lib/model-router/store';
import { FREE_ONLY } from '@/lib/model-router/registry';
import type { ModelDef, SelectionMode } from '@/lib/model-router/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from '@forge/ui/dropdown-menu';
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
        'text-[10px] font-medium uppercase px-1.5 py-0.5 rounded',
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
// Model option row (no health dot; primary + fallbacks from preferences)
// ---------------------------------------------------------------------------

function ModelOption({
  model,
  showTierBadge,
  isActive,
}: {
  model: ModelDef;
  showTierBadge: boolean;
  isActive: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2', isActive && 'text-foreground font-medium')}>
      <span className="flex-1 truncate">{model.label}</span>
      {showTierBadge && <TierBadge tier={model.tier} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ModelSwitcher() {
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
    () => registry.find((model) => model.id === activeModelId),
    [registry, activeModelId],
  );
  const activeLabel = activeModel?.label ?? activeModelId.split('/').pop() ?? 'Unknown';
  const fallbackLabel =
    fallbackIds.length > 0 ? ` +${fallbackIds.length} fallback${fallbackIds.length === 1 ? '' : 's'}` : '';
  const triggerLabel =
    mode === 'auto' ? `Auto: ${activeLabel}${fallbackLabel}` : activeLabel;

  const freeModels = useMemo(() => registry.filter((model) => model.tier === 'free'), [registry]);
  const paidModels = useMemo(() => registry.filter((model) => model.tier === 'paid'), [registry]);
  const showTierBadge = !FREE_ONLY;

  const handleModeChange = (value: string) => {
    setMode(value as SelectionMode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EditorButton
          variant="ghost"
          size="sm"
          tooltip="Model routing"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2 max-w-[200px]">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isLoading ? 'bg-muted-foreground/60 animate-pulse' : 'bg-emerald-400',
              )}
            />
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </span>
        </EditorButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Model routing</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mode} onValueChange={handleModeChange}>
          <DropdownMenuRadioItem value="auto">
            Auto (primary + fallbacks)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="manual">Manual (pick one)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />

        {registry.length === 0 && !isLoading ? (
          <DropdownMenuLabel className="text-muted-foreground font-normal">
            Models load from OpenRouter when available. Check API key if empty.
          </DropdownMenuLabel>
        ) : mode === 'auto' ? (
          <>
            <DropdownMenuLabel>Enabled models (order = primary, then fallbacks)</DropdownMenuLabel>
            {(FREE_ONLY ? registry : freeModels).map((model) => (
              <DropdownMenuCheckboxItem
                key={model.id}
                checked={enabledModelIds.includes(model.id)}
                onCheckedChange={() => toggleModel(model.id)}
                onSelect={(event) => event.preventDefault()}
              >
                <ModelOption
                  model={model}
                  showTierBadge={showTierBadge}
                  isActive={model.id === activeModelId}
                />
              </DropdownMenuCheckboxItem>
            ))}
            {!FREE_ONLY && paidModels.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Paid models</DropdownMenuLabel>
                {paidModels.map((model) => (
                  <DropdownMenuCheckboxItem
                    key={model.id}
                    checked={enabledModelIds.includes(model.id)}
                    onCheckedChange={() => toggleModel(model.id)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    <ModelOption
                      model={model}
                      showTierBadge={showTierBadge}
                      isActive={model.id === activeModelId}
                    />
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <DropdownMenuLabel>Manual model</DropdownMenuLabel>
            {registry.length === 0 ? null : (
            <DropdownMenuRadioGroup
              value={activeModelId}
              onValueChange={(value) => setManualModel(value)}
            >
              {registry.map((model) => (
                <DropdownMenuRadioItem key={model.id} value={model.id}>
                  <ModelOption
                    model={model}
                    showTierBadge={showTierBadge}
                    isActive={model.id === activeModelId}
                  />
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
