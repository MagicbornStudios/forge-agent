import { postJson, getJson } from '@/lib/api/http';
import type {
  EnvDoctorResponse,
  EnvReconcileResponse,
  EnvTargetPayload,
  RepoMode,
} from '@/lib/api/types';

export async function runEnvDoctor(input: { profile: string; mode: RepoMode }) {
  return postJson<EnvDoctorResponse>('/api/env/doctor', input, {
    fallbackMessage: 'Unable to run env doctor.',
  });
}

export async function runEnvReconcile(input: { profile: string; mode: RepoMode }) {
  return postJson<EnvReconcileResponse>('/api/env/reconcile', input, {
    fallbackMessage: 'Unable to run env reconcile.',
  });
}

export async function fetchEnvTarget(input: { targetId: string; profile: string; mode: RepoMode }) {
  const params = new URLSearchParams({
    profile: input.profile,
    mode: input.mode,
  });
  return getJson<EnvTargetPayload>(
    `/api/env/target/${encodeURIComponent(input.targetId)}?${params.toString()}`,
    {
      fallbackMessage: `Unable to load env target ${input.targetId}.`,
    },
  );
}

export async function saveEnvTarget(input: {
  targetId: string;
  profile: string;
  mode: RepoMode;
  values: Record<string, string>;
}) {
  return postJson<EnvTargetPayload>(
    `/api/env/target/${encodeURIComponent(input.targetId)}`,
    {
      profile: input.profile,
      mode: input.mode,
      values: input.values,
    },
    {
      fallbackMessage: `Unable to save env target ${input.targetId}.`,
    },
  );
}

