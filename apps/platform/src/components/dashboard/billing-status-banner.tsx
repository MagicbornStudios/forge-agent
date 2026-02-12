'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { StorageSummary } from '@/lib/api/studio';

type BillingStatusBannerProps = {
  storage: StorageSummary | null | undefined;
};

export function BillingStatusBanner({ storage }: BillingStatusBannerProps) {
  if (!storage) return null;
  if (!storage.warning && !storage.overLimit) return null;

  return (
    <Alert variant={storage.overLimit ? 'destructive' : 'default'}>
      <AlertTitle>
        {storage.overLimit ? 'Storage limit exceeded' : 'Storage warning'}
      </AlertTitle>
      <AlertDescription>
        {storage.overLimit
          ? 'Uploads and clone operations may be blocked until you upgrade storage or reduce usage.'
          : `Storage usage is above ${storage.storageWarningThresholdPercent}% of your quota.`}
      </AlertDescription>
    </Alert>
  );
}
