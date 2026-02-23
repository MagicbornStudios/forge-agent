'use client';

import * as React from 'react';
import type { PlanningSnapshot, RepoLoopsSnapshot } from '@/lib/repo-data';
import { toErrorMessage } from '@/lib/api/http';
import { fetchLoopSnapshot, setActiveLoop as setActiveLoopRequest } from '@/lib/api/services';

export function usePlanningSync(
  initialPlanning: PlanningSnapshot,
  initialLoops: RepoLoopsSnapshot,
  options: {
    activeWorkspaceId: string;
    activeLoopId: string;
    setActiveLoopId: (id: string) => void;
    setProfile: (value: string) => void;
    setCommandOutput: (value: string | ((prev: string) => string)) => void;
    loadSettingsSnapshot: (workspaceId: string, loopId: string) => Promise<void>;
  },
) {
  const {
    activeWorkspaceId,
    activeLoopId,
    setActiveLoopId,
    setProfile,
    setCommandOutput,
    loadSettingsSnapshot,
  } = options;

  const [planningSnapshot, setPlanningSnapshot] = React.useState(initialPlanning);
  const [loopSnapshot, setLoopSnapshot] = React.useState(initialLoops);
  const [switchingLoop, setSwitchingLoop] = React.useState(false);

  const refreshLoopSnapshot = React.useCallback(
    async (loopId: string) => {
      const payload = await fetchLoopSnapshot(loopId);
      if (!payload.ok) {
        throw new Error(payload.message || 'Unable to refresh loop snapshot.');
      }
      if (payload.loops) {
        setLoopSnapshot(payload.loops as RepoLoopsSnapshot);
        if (payload.loops.activeLoopId) {
          setActiveLoopId(String(payload.loops.activeLoopId));
          const active = payload.loops.entries?.find(
            (entry: { id?: string; profile?: string }) => entry.id === payload.loops?.activeLoopId,
          );
          if (active?.profile) setProfile(String(active.profile));
        }
      }
      if (payload.planning) {
        setPlanningSnapshot(payload.planning as PlanningSnapshot);
      }
      const resolvedLoopId = String(payload?.loops?.activeLoopId || loopId || 'default');
      await loadSettingsSnapshot(activeWorkspaceId, resolvedLoopId);
    },
    [
      activeWorkspaceId,
      loadSettingsSnapshot,
      setActiveLoopId,
      setProfile,
    ],
  );

  const switchLoop = React.useCallback(
    async (loopId: string) => {
      if (!loopId || loopId === activeLoopId) return;
      setSwitchingLoop(true);
      try {
        const payload = await setActiveLoopRequest(loopId);
        if (!payload.ok) {
          setCommandOutput(
            payload.message || payload.stderr || 'Unable to switch loop.',
          );
          setSwitchingLoop(false);
          return;
        }
        await refreshLoopSnapshot(loopId);
        setCommandOutput(payload.message || `Active loop set to ${loopId}.`);
      } catch (error) {
        setCommandOutput(toErrorMessage(error, `Unable to switch to loop ${loopId}.`));
      } finally {
        setSwitchingLoop(false);
      }
    },
    [activeLoopId, refreshLoopSnapshot, setCommandOutput],
  );

  return {
    planningSnapshot,
    setPlanningSnapshot,
    loopSnapshot,
    setLoopSnapshot,
    switchingLoop,
    refreshLoopSnapshot,
    switchLoop,
  };
}
