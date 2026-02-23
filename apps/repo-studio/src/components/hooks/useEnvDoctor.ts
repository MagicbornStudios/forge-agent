'use client';

import * as React from 'react';
import type {
  DependencyHealth,
  EnvDoctorPayload,
  RepoMode,
  RuntimeDepsResponse,
} from '@/lib/api/types';
import { toErrorMessage } from '@/lib/api/http';
import {
  runEnvDoctor as runEnvDoctorRequest,
  runEnvReconcile as runEnvReconcileRequest,
  fetchRuntimeDependencies,
} from '@/lib/api/services';

const INITIAL_ENV_OUTPUT = 'Run "Doctor" to check environment readiness.';

export function useEnvDoctor(profile: string, mode: RepoMode): {
  envOutput: string;
  envDoctorPayload: EnvDoctorPayload | null;
  dependencyHealth: DependencyHealth | null;
  runtimeDeps: RuntimeDepsResponse | null;
  runEnvDoctor: () => Promise<void>;
  runEnvReconcile: () => Promise<void>;
  refreshDependencyHealth: () => Promise<void>;
} {
  const [envOutput, setEnvOutput] = React.useState(INITIAL_ENV_OUTPUT);
  const [envDoctorPayload, setEnvDoctorPayload] = React.useState<EnvDoctorPayload | null>(null);
  const [dependencyHealth, setDependencyHealth] = React.useState<DependencyHealth | null>(null);
  const [runtimeDeps, setRuntimeDeps] = React.useState<RuntimeDepsResponse | null>(null);

  const refreshDependencyHealth = React.useCallback(async () => {
    const payload = await fetchRuntimeDependencies();
    setRuntimeDeps(payload || null);
    if (payload?.deps) {
      setDependencyHealth(payload.deps as DependencyHealth);
    } else {
      setDependencyHealth(null);
    }
  }, []);

  const runEnvDoctor = React.useCallback(async () => {
    try {
      const payload = await runEnvDoctorRequest({ profile, mode });
      setEnvDoctorPayload((payload.payload ?? null) as EnvDoctorPayload | null);
      const lines = [
        payload.report || '',
        payload.stderr || '',
        payload.resolvedAttempt ? `resolved: ${payload.resolvedAttempt}` : '',
      ].filter(Boolean);
      setEnvOutput(lines.join('\n\n') || 'No env output.');
    } catch (error) {
      setEnvOutput(toErrorMessage(error, 'Unable to run env doctor.'));
    }
  }, [mode, profile]);

  const runEnvReconcile = React.useCallback(async () => {
    try {
      const payload = await runEnvReconcileRequest({ profile, mode });
      const lines = [
        payload.report || payload.stdout || '',
        payload.stderr || '',
        payload.command ? `command: ${payload.command}` : '',
        payload.resolvedAttempt ? `resolved: ${payload.resolvedAttempt}` : '',
      ].filter(Boolean);
      setEnvOutput(lines.join('\n\n') || 'No env output.');
      await runEnvDoctor();
      await refreshDependencyHealth();
    } catch (error) {
      setEnvOutput(toErrorMessage(error, 'Unable to run env reconcile.'));
    }
  }, [mode, profile, refreshDependencyHealth, runEnvDoctor]);

  return {
    envOutput,
    envDoctorPayload,
    dependencyHealth,
    runtimeDeps,
    runEnvDoctor,
    runEnvReconcile,
    refreshDependencyHealth,
  };
}
