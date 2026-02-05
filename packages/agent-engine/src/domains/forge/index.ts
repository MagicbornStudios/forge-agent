import type { Workflow } from '../../workflow/types';
import { registerWorkflow } from '../../workflow/registry';
import { forgePlanExecuteReviewCommit } from './plan-execute-review-commit';

export function registerForgeWorkflows(): void {
  registerWorkflow(forgePlanExecuteReviewCommit as Workflow);
}

export { forgePlanExecuteReviewCommit };
