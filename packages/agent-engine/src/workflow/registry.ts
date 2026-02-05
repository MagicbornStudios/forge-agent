import type { Workflow } from './types';

const workflows = new Map<string, Workflow>();

export function registerWorkflow(workflow: Workflow): void {
  if (workflows.has(workflow.id)) {
    return;
  }
  workflows.set(workflow.id, workflow);
}

export function getWorkflow(id: string): Workflow {
  const wf = workflows.get(id);
  if (!wf) throw new Error(`Unknown workflow: ${id}`);
  return wf;
}

export function listWorkflows(): string[] {
  return [...workflows.keys()].sort();
}
