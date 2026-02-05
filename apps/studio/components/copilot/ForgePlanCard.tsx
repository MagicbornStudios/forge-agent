'use client';

import React, { useMemo, useState } from 'react';
import { useCopilotContext } from '@copilotkit/react-core';
import { PlanCard, PlanActionBar, type PlanCardProps } from '@forge/shared/copilot/generative-ui';
import { describePlanStep, type ForgePlanStep } from '@forge/domain-forge/copilot/plan-utils';

interface ForgePlanCardProps {
  status: string;
  args: Record<string, unknown>;
  result?: { success: boolean; message?: string; data?: { steps?: unknown[] } };
}

export function ForgePlanCard({ status, args, result }: ForgePlanCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const { actions } = useCopilotContext();
  const executeAction = actions['forge_executePlan'];
  const executeHandler = executeAction?.handler;

  const steps = useMemo(() => {
    const raw = (result?.data as { steps?: unknown[] } | undefined)?.steps;
    return Array.isArray(raw) ? raw : [];
  }, [result?.data]);

  const stepItems = useMemo(
    () =>
      steps.map((step) =>
        describePlanStep(
          (typeof step === 'object' && step !== null ? step : {}) as ForgePlanStep
        )
      ),
    [steps]
  );

  const planStatus: PlanCardProps['status'] = status === 'complete'
    ? result?.success
      ? 'complete'
      : 'error'
    : status === 'executing' || status === 'inProgress'
      ? 'inProgress'
      : 'idle';

  const showActions = planStatus === 'complete' && result?.success && steps.length > 0;

  const handleApply = async () => {
    if (!executeHandler || !showActions) return;
    setIsApplying(true);
    try {
      await executeHandler({ steps });
    } finally {
      setIsApplying(false);
    }
  };

  if (dismissed) return <></>;

  const goal = typeof args.goal === 'string' ? args.goal.trim() : '';
  const summary = goal ? `Goal: ${goal}` : undefined;

  return (
    <PlanCard
      title="Plan"
      summary={summary}
      steps={stepItems}
      status={planStatus}
      footer={
        showActions ? (
          <PlanActionBar
            onAccept={handleApply}
            onReject={() => setDismissed(true)}
            acceptLabel={isApplying ? 'Applying...' : 'Apply plan'}
            rejectLabel="Dismiss"
            disabled={isApplying || !executeHandler}
          />
        ) : undefined
      }
    />
  );
}
