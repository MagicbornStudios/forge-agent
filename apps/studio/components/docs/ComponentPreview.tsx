'use client';

import React, { Suspense } from 'react';
import { AppProviders } from '@forge/shared';
import { cn } from '@forge/ui/lib/utils';
import { Index, type RegistryName } from '@/registry/__index__';
import { Loader2 } from 'lucide-react';

export function ComponentPreview({
  name,
  className,
}: {
  name: RegistryName;
  className?: string;
}) {
  const entry = Index[name];
  if (!entry) {
    return (
      <div className={cn('rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive', className)}>
        Unknown example: &quot;{name}&quot;
      </div>
    );
  }

  const Component = entry.component;
  return (
    <div className={cn('rounded-lg border border-border bg-muted/30 p-6', className)}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <AppProviders>
          <Component />
        </AppProviders>
      </Suspense>
    </div>
  );
}
