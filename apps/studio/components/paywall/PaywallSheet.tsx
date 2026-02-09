'use client';

import * as React from 'react';
import { Button } from '@forge/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@forge/ui/sheet';
import { Badge } from '@forge/ui/badge';
import { usePaywallStore } from '@/lib/entitlements/paywall';

export function PaywallSheet() {
  const open = usePaywallStore((s) => s.open);
  const capability = usePaywallStore((s) => s.capability);
  const info = usePaywallStore((s) => s.info);
  const closePaywall = usePaywallStore((s) => s.closePaywall);

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? closePaywall() : undefined)}>
      <SheetContent side="right" className="w-[360px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Upgrade to unlock</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            This feature is locked for your current plan.
          </div>
          {capability && (
            <div className="text-xs text-muted-foreground">
              Capability: <Badge variant="outline">{capability}</Badge>
            </div>
          )}
          {info?.requiredPlan && (
            <div className="text-xs text-muted-foreground">
              Required plan: <Badge>{info.requiredPlan}</Badge>
            </div>
          )}
          <div className="flex gap-[var(--control-gap)]">
            <Button onClick={() => console.info('[Paywall] Upgrade clicked')}>Upgrade</Button>
            <Button variant="outline" onClick={closePaywall}>Close</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
