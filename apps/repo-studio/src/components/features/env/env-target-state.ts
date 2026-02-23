import type { EnvTargetPayload } from '@/lib/api/types';

export type EnvTargetSummaryLike = {
  targetId: string;
};

export function deriveNextSelectedTargetId(
  filteredTargets: EnvTargetSummaryLike[],
  selectedTargetId: string,
) {
  if (!Array.isArray(filteredTargets) || filteredTargets.length === 0) return '';
  const normalized = String(selectedTargetId || '').trim();
  if (normalized && filteredTargets.some((target) => target.targetId === normalized)) {
    return normalized;
  }
  return String(filteredTargets[0]?.targetId || '').trim();
}

export function shouldResetTargetState(input: {
  selectedTargetId: string;
  targetPayload: EnvTargetPayload | null;
  editedValues: Record<string, string>;
  hasTargets?: boolean;
}) {
  if (input.hasTargets === true) return false;
  if (String(input.selectedTargetId || '').trim()) return true;
  if (input.targetPayload != null) return true;
  return Object.keys(input.editedValues || {}).length > 0;
}
