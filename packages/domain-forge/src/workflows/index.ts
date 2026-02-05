import type { Workflow } from '@forge/agent-engine/workflow/types';
import { registerWorkflow } from '@forge/agent-engine/workflow/registry';
import { forgePlanExecuteReviewCommit } from './plan-execute-review-commit';

export function registerForgeWorkflows(): void {
  registerWorkflow(forgePlanExecuteReviewCommit as Workflow);
}

export { forgePlanExecuteReviewCommit };
