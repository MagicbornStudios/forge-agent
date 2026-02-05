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
import { WorkspaceButton } from '@forge/shared/components/workspace';

// ---------------------------------------------------------------------------
// Tier badge
// ---------------------------------------------------------------------------

function TierBadge({ tier }: { tier: 'free' | 'paid' }) {
  return (
    <span
      className={cn(
        'text-[10px] font-medium uppercase px-1.5 py-0.5 rounded',
        tier === 'free'
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-amber-500/15 text-amber-300',
      )}
    >
      {tier}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Health dot
// ---------------------------------------------------------------------------

function HealthDot({ modelId }: { modelId: string }) {
  const health = useModelRouterStore((s) => s.health[modelId]);
  if (!health) return <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />;
  const now = Date.now();
  const inCooldown = health.cooldownUntil != null && now < health.cooldownUntil;
  if (inCooldown) {
    return <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="In cooldown" />;
  }
  if (health.errorCount > 0) {
    return <span className="w-2 h-2 rounded-full bg-amber-400" title="Recent errors" />;
  }
  return <span className="w-2 h-2 rounded-full bg-emerald-400" title="Healthy" />;
}

// ---------------------------------------------------------------------------
// Model option row
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
      <HealthDot modelId={model.id} />
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
  const triggerLabel = mode === 'auto' ? `Auto: ${activeLabel}` : activeLabel;

  const freeModels = useMemo(() => registry.filter((model) => model.tier === 'free'), [registry]);
  const paidModels = useMemo(() => registry.filter((model) => model.tier === 'paid'), [registry]);
  const showTierBadge = !FREE_ONLY;

  const handleModeChange = (value: string) => {
    setMode(value as SelectionMode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <WorkspaceButton
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
        </WorkspaceButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Model routing</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mode} onValueChange={handleModeChange}>
          <DropdownMenuRadioItem value="auto">
            Auto rotation (enabled models)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="manual">Manual (pick one)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />

        {mode === 'auto' ? (
          <>
            <DropdownMenuLabel>Enabled models</DropdownMenuLabel>
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
