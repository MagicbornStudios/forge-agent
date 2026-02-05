import type { PatchEnvelope, ReviewResult } from './patch';
import type { WorkflowRunResult } from './types';

export type WorkflowEvent =
  | { type: 'run.start'; runId: string; workflowId: string; ts: number }
  | { type: 'run.end'; runId: string; workflowId: string; ts: number }
  | { type: 'run.result'; runId: string; workflowId: string; result: WorkflowRunResult; ts: number }
  | { type: 'step.start'; runId: string; stepId: string; ts: number }
  | { type: 'step.delta'; runId: string; stepId: string; channel: string; delta: string; ts: number }
  | { type: 'step.end'; runId: string; stepId: string; ts: number }
  | { type: 'artifact.plan.delta'; runId: string; delta: string; ts: number }
  | { type: 'artifact.plan.final'; runId: string; markdown: string; ts: number }
  | { type: 'artifact.patch.final'; runId: string; patch: PatchEnvelope; ts: number }
  | { type: 'artifact.review.final'; runId: string; review: ReviewResult; ts: number }
  | { type: 'tool.call'; runId: string; tool: string; input?: unknown; ts: number }
  | { type: 'tool.result'; runId: string; tool: string; output?: unknown; ts: number }
  | { type: 'error'; runId: string; message: string; detail?: unknown; ts: number };
