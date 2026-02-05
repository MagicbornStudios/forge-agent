'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { LockedOverlay } from '@forge/ui/locked-overlay';
import type { CapabilityId } from '../../entitlements/capabilities';
import { useEntitlements } from '../../entitlements/context';
import type { EntitlementInfo } from '../../entitlements/types';

export type FeatureGateMode = 'hide' | 'disable' | 'lock-overlay';

export interface FeatureGateProps {
  capability: CapabilityId;
  mode?: FeatureGateMode;
  fallback?: React.ReactNode;
  reason?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function FeatureGate({
  capability,
  mode = 'lock-overlay',
  fallback,
  reason,
  actionLabel,
  onAction,
  className,
  children,
}: FeatureGateProps) {
  const entitlements = useEntitlements();
  const info = entitlements.get(capability);

  if (info.status === 'allowed') {
    return <>{children}</>;
  }

  if (info.status === 'hidden' || mode === 'hide') {
    return <>{fallback ?? null}</>;
  }

  if (mode === 'disable') {
    return (
      <div className={cn('relative opacity-60 pointer-events-none select-none', className)} aria-disabled="true">
        {children}
      </div>
    );
  }

  const handleAction = () => {
    onAction?.();
    entitlements.openPaywall?.(capability, info);
  };

  return (
    <div className={cn('relative', className)}>
      {children}
      <LockedOverlay
        title="Locked"
        description={reason ?? info.reason ?? 'Upgrade to unlock this feature.'}
        actionLabel={actionLabel}
        onAction={entitlements.openPaywall || onAction ? handleAction : undefined}
      />
    </div>
  );
}

export type { EntitlementInfo };
