'use client';

import { useEffect } from 'react';
import { useForgeGraphsStore } from '@/lib/domains/forge/store';

/** Subscribes to draft dirty state and shows beforeunload when any draft has unsaved changes. */
export function DirtyBeforeUnload() {
  const forgeDirty = useForgeGraphsStore(
    (s) => s.dirtyByScope.narrative || s.dirtyByScope.storylet
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (forgeDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [forgeDirty]);

  return null;
}
