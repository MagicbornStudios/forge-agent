'use client';

import { useEffect } from 'react';
import { useGraphStore } from '@/lib/store';
import { useVideoStore } from '@/lib/domains/video/store';

/** Subscribes to draft dirty state and shows beforeunload when any draft has unsaved changes. */
export function DirtyBeforeUnload() {
  const graphDirty = useGraphStore((s) => s.isDirty);
  const videoDirty = useVideoStore((s) => s.isDirty);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (graphDirty || videoDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [graphDirty, videoDirty]);

  return null;
}
