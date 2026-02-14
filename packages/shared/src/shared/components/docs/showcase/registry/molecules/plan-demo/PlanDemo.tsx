'use client';

import { Plan, parseSerializablePlan } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

const PLAN_FIXTURE = parseSerializablePlan({
  id: 'plan-demo-preview',
  role: 'state',
  title: 'Showcase rollout plan',
  todos: [
    { id: 'scan', label: 'Scan source components', status: 'completed' },
    { id: 'generate', label: 'Generate docs pages', status: 'completed' },
    { id: 'render', label: 'Implement runtime demos', status: 'in_progress' },
  ],
});

export function PlanDemo() {
  return (
    <ShowcaseDemoSurface>
      <Plan {...PLAN_FIXTURE} />
    </ShowcaseDemoSurface>
  );
}
