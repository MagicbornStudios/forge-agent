import type { WorkflowContext, Emit } from './types';
import type { WorkflowRunResult } from './events';
import { getWorkflow } from './registry';
import { runWorkflow } from './executor';

export async function runSubworkflow<In>(
  workflowId: string,
  ctx: WorkflowContext,
  input: In,
  emit: Emit
): Promise<WorkflowRunResult> {
  const workflow = getWorkflow(workflowId);
  const subCtx: WorkflowContext = { ...ctx, workflowId };
  return runWorkflow(workflow as any, subCtx, input as any, emit);
}
