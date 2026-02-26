'use client';

import { useState, useCallback, useMemo } from 'react';

export interface PanelLockState {
  /** Whether the panel is currently locked. */
  locked: boolean;
  /** Reason for the lock (displayed in the LockedOverlay). */
  reason: string | null;
  /** Lock the panel with an optional reason. */
  lock: (reason?: string) => void;
  /** Unlock the panel. */
  unlock: () => void;
  /** Toggle the lock state. */
  toggle: () => void;
}

/**
 * usePanelLock — manages the lock state of a `WorkspacePanel`.
 *
 * When a panel is locked (e.g. during AI patch application), the
 * `WorkspacePanel` component shows a `LockedOverlay` and prevents user
 * interaction with the panel content.
 *
 * @example
 * ```tsx
 * function ForgeMode() {
 *   const editorLock = usePanelLock();
 *
 *   // Lock during AI plan application
 *   const handleApplyPlan = async (plan) => {
 *     editorLock.lock('AI is applying changes…');
 *     try {
 *       await applyPlan(plan);
 *     } finally {
 *       editorLock.unlock();
 *     }
 *   };
 *
 *   return (
 *     <WorkspacePanel
 *       panelId="editor"
 *       locked={editorLock.locked}
 *       lockedProps={{ description: editorLock.reason ?? undefined }}
 *       scrollable={false}
 *     >
 *       <GraphEditor ... />
 *     </WorkspacePanel>
 *   );
 * }
 * ```
 */
export function usePanelLock(initialLocked = false): PanelLockState {
  const [locked, setLocked] = useState(initialLocked);
  const [reason, setReason] = useState<string | null>(null);

  const lock = useCallback((lockReason?: string) => {
    setLocked(true);
    setReason(lockReason ?? 'Panel is locked');
  }, []);

  const unlock = useCallback(() => {
    setLocked(false);
    setReason(null);
  }, []);

  const toggle = useCallback(() => {
    setLocked((prev) => {
      if (prev) {
        setReason(null);
        return false;
      }
      setReason('Panel is locked');
      return true;
    });
  }, []);

  return useMemo(
    () => ({ locked, reason, lock, unlock, toggle }),
    [locked, reason, lock, unlock, toggle],
  );
}
