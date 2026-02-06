'use client';

import { useMutation } from '@tanstack/react-query';
import { AiService } from '@/lib/api-client';

export interface CreateForgePlanParams {
  goal: string;
  graphSummary?: unknown;
}

export interface ForgePlanStep {
  type: 'createNode' | 'updateNode' | 'deleteNode' | 'createEdge';
  [key: string]: unknown;
}

export interface CreateForgePlanResult {
  steps: ForgePlanStep[];
}

/**
 * TanStack Query mutation for generating a Forge graph plan via LLM.
 *
 * Wraps `AiService.postApiForgePlan` to eliminate raw service calls.
 *
 * @example
 * ```tsx
 * const createPlan = useCreateForgePlan();
 * const { steps } = await createPlan.mutateAsync({ goal: 'Add a dialogue branch', graphSummary });
 * ```
 */
export function useCreateForgePlan() {
  return useMutation<CreateForgePlanResult, Error, CreateForgePlanParams>({
    mutationFn: async (params) => {
      const data = await AiService.postApiForgePlan({
        goal: params.goal,
        ...(params.graphSummary && { graphSummary: params.graphSummary }),
      });
      if (!data?.steps || !Array.isArray(data.steps)) {
        throw new Error('Plan generation failed — no steps in response');
      }
      return { steps: data.steps as ForgePlanStep[] };
    },
  });
}
