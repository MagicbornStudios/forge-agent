import type { PatchEnvelope, ReviewResult } from './patch';

export interface DomainWorkflowContract<Snapshot = unknown, PatchOps = unknown> {
  /** Snapshot used for planning/proposal/review. */
  getSnapshot: () => Snapshot;
  /** Optional selection info (node ids, text ranges, etc). */
  getSelection?: () => unknown;
  /** Apply patch to the local draft (preview). */
  applyDraftPatch: (patch: PatchEnvelope<any, PatchOps>) => void;
  /** Commit patch to persistence (server). */
  commitPatch: (patch: PatchEnvelope<any, PatchOps>) => Promise<void>;
  /** Validate patch against invariants. */
  validatePatch: (snapshot: Snapshot, patch: PatchEnvelope<any, PatchOps>) => ReviewResult;
  /** Optional tools for internal workflow steps. */
  tools?: Record<string, (input: unknown) => Promise<unknown>>;
}
