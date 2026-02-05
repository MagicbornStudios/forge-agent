import type { WorkflowEvent, WorkflowRunResult } from './events';

export type Emit = (event: WorkflowEvent) => void | Promise<void>;

export type WorkflowContext = {
  runId: string;
  workflowId: string;
  intent: string;
  domain: string;
  snapshot: unknown;
  selection?: unknown;
  runtime?: Record<string, unknown>;
};

export type Step<In = unknown, Out = unknown> = {
  id: string;
  run: (ctx: WorkflowContext, input: In, emit: Emit) => Promise<Out>;
};

export type Workflow<In = unknown, Out extends WorkflowRunResult = WorkflowRunResult> = {
  id: string;
  steps: Step[];
  run: (ctx: WorkflowContext, input: In, emit: Emit) => Promise<Out>;
};
