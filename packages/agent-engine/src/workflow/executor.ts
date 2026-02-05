import type { Workflow, WorkflowContext, Emit } from './types';
import type { WorkflowRunResult } from './events';

function now(): number {
  return Date.now();
}

export async function runWorkflow<In>(
  wf: Workflow<In>,
  ctx: WorkflowContext,
  input: In,
  emit: Emit
): Promise<WorkflowRunResult> {
  await emit({ type: 'run.start', runId: ctx.runId, workflowId: ctx.workflowId, ts: now() });

  try {
    const result = await wf.run(ctx, input, emit);
    await emit({ type: 'run.end', runId: ctx.runId, workflowId: ctx.workflowId, ts: now() });
    return result;
  } catch (err) {
    await emit({
      type: 'error',
      runId: ctx.runId,
      message: err instanceof Error ? err.message : 'Unknown error',
      detail: err,
      ts: now(),
    });
    await emit({ type: 'run.end', runId: ctx.runId, workflowId: ctx.workflowId, ts: now() });

    return {
      runId: ctx.runId,
      workflowId: ctx.workflowId,
      trace: [],
    };
  }
}
