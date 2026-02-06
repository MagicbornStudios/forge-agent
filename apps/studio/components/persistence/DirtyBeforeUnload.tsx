'use client';

import { useEffect } from 'react';
import { useForgeGraphsStore } from '@/lib/domains/forge/store';
import { useVideoStore } from '@/lib/domains/video/store';

/** Subscribes to draft dirty state and shows beforeunload when any draft has unsaved changes. */
export function DirtyBeforeUnload() {
  const forgeDirty = useForgeGraphsStore(
    (s) => s.dirtyByScope.narrative || s.dirtyByScope.storylet
  );
  const videoDirty = useVideoStore((s) => s.isDirty);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (forgeDirty || videoDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [forgeDirty, videoDirty]);

  return null;
}
