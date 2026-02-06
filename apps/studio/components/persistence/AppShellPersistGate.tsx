'use client';

import { useEffect, useState } from 'react';
import { useAppShellStore } from '@/lib/app-shell/store';

/** Rehydrates app-shell persisted state before rendering children so lastForgeProjectId/lastVideoDocId are available on first meaningful render. */
export function AppShellPersistGate({ children }: { children: React.ReactNode }) {
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    const p = useAppShellStore.persist.rehydrate();
    if (p && typeof (p as Promise<void>).then === 'function') {
      (p as Promise<void>).then(() => setRehydrated(true));
    } else {
      setRehydrated(true);
    }
  }, []);

  if (!rehydrated) return null;
  return <>{children}</>;
}
