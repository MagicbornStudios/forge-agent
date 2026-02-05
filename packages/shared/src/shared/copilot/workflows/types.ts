import type { PatchEnvelope, ReviewResult } from './patch';

export type WorkflowRunInput = {
  workflowId: string;
  domain: string;
  intent: string;
  input?: Record<string, unknown>;
  snapshot: unknown;
  selection?: unknown;
  runtime?: Record<string, unknown>;
};

export type WorkflowRunResult = {
  runId: string;
  workflowId: string;
  planMarkdown?: string;
  patch?: PatchEnvelope;
  review?: ReviewResult;
  trace: Array<{ stepId: string; ms: number }>;
};
