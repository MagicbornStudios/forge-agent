'use client';

import * as React from 'react';
import { makeAssistantToolUI } from '@assistant-ui/react';
import { Plan } from '@forge/shared/components/tool-ui/plan';
import type { PlanTodo } from '@forge/shared/components/tool-ui/plan/schema';
import { describePlanStep, type ForgePlanStep } from '../copilot/plan-utils';

type ForgePlanResult = {
  success?: boolean;
  goal?: string;
  data?: { steps?: unknown[]; goal?: string };
};

const ForgePlanExecuteContext = React.createContext<
  ((steps: unknown[]) => void | Promise<void>) | null
>(null);

export function ForgePlanExecuteProvider({
  executePlan,
  children,
}: {
  executePlan: (steps: unknown[]) => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <ForgePlanExecuteContext.Provider value={executePlan}>
      {children}
    </ForgePlanExecuteContext.Provider>
  );
}

export const ForgePlanToolUI = makeAssistantToolUI<
  { goal: string },
  ForgePlanResult
>({
  toolName: 'forge_createPlan',
  render: ({ result, status }) => {
    const executePlan = React.useContext(ForgePlanExecuteContext);

    if (status?.type === 'running' && result == null) {
      return (
        <div className="rounded border p-3 bg-muted/20">
          Creating plan...
        </div>
      );
    }

    const steps = Array.isArray(result?.data?.steps) ? result.data.steps : [];
    const goal = result?.goal ?? result?.data?.goal ?? 'Plan';

    if (!result?.success || steps.length === 0) return null;

    const todos: PlanTodo[] = steps.map((s, i) => {
      const step = (typeof s === 'object' && s !== null ? s : {}) as ForgePlanStep;
      const desc = describePlanStep(step);
      return {
        id: String(i),
        label: desc.title,
        status: 'pending' as const,
        description: desc.description,
      };
    });

    const handleResponseAction = (id: string) => {
      if (id === 'approve' && executePlan) {
        void executePlan(steps);
      }
    };

    return (
      <Plan
        id="forge-plan"
        title={typeof goal === 'string' ? goal : 'Plan'}
        todos={todos}
        responseActions={[
          { id: 'approve', label: 'Apply Plan' },
          { id: 'revise', label: 'Request Changes', variant: 'secondary' },
        ]}
        onResponseAction={handleResponseAction}
      />
    );
  },
});
