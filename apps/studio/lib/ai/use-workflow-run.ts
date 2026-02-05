'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  PatchEnvelope,
  ReviewResult,
  WorkflowRunInput,
  WorkflowRunResult,
  WorkflowEvent,
} from '@forge/shared/copilot/workflows';
import { streamWorkflowRun } from '@/lib/api-client/workflows';

export type WorkflowStepState = {
  currentStepId: string | null;
  steps: Array<{ stepId: string; status: 'pending' | 'running' | 'done' | 'error' }>;
};

export type WorkflowUIState = {
  runId: string | null;
  workflowId: string | null;
  isRunning: boolean;
  planMarkdown: string;
  patch: PatchEnvelope | null;
  review: ReviewResult | null;
  step: WorkflowStepState;
  events: WorkflowEvent[];
  error: string | null;
  result: WorkflowRunResult | null;
};

function parseSseChunk(buffer: string): { events: Array<{ event: string; data: WorkflowEvent }>; rest: string } {
  const parts = buffer.split('\n\n');
  const complete = parts.slice(0, -1);
  const rest = parts[parts.length - 1] ?? '';

  const events = complete
    .map((block) => {
      const lines = block.split('\n').filter(Boolean);
      let event = 'message';
      let dataLine = '';
      for (const line of lines) {
        if (line.startsWith('event:')) event = line.slice('event:'.length).trim();
        if (line.startsWith('data:')) dataLine += line.slice('data:'.length).trim();
      }
      if (!dataLine) return null;
      try {
        return { event, data: JSON.parse(dataLine) as WorkflowEvent };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Array<{ event: string; data: WorkflowEvent }>;

  return { events, rest };
}

function upsertStep(
  steps: Array<{ stepId: string; status: 'pending' | 'running' | 'done' | 'error' }>,
  stepId: string,
  status: 'pending' | 'running' | 'done' | 'error'
) {
  const idx = steps.findIndex((x) => x.stepId === stepId);
  if (idx === -1) return [...steps, { stepId, status }];
  const next = steps.slice();
  next[idx] = { stepId, status };
  return next;
}

export function useWorkflowRun() {
  const abortRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<WorkflowUIState>({
    runId: null,
    workflowId: null,
    isRunning: false,
    planMarkdown: '',
    patch: null,
    review: null,
    step: { currentStepId: null, steps: [] },
    events: [],
    error: null,
    result: null,
  });

  const reset = useCallback(() => {
    setState({
      runId: null,
      workflowId: null,
      isRunning: false,
      planMarkdown: '',
      patch: null,
      review: null,
      step: { currentStepId: null, steps: [] },
      events: [],
      error: null,
      result: null,
    });
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((s) => ({ ...s, isRunning: false }));
  }, []);

  const run = useCallback(async (input: WorkflowRunInput) => {
    reset();

    const ac = new AbortController();
    abortRef.current = ac;

    setState((s) => ({
      ...s,
      workflowId: input.workflowId,
      isRunning: true,
      error: null,
    }));

    let stream: ReadableStream<Uint8Array>;
    try {
      stream = await streamWorkflowRun(input, { signal: ac.signal });
    } catch (err) {
      setState((s) => ({
        ...s,
        isRunning: false,
        error: err instanceof Error ? err.message : 'Workflow failed',
      }));
      return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseChunk(buffer);
      buffer = parsed.rest;

      for (const evt of parsed.events) {
        const data = evt.data;

        setState((s) => {
          const next = { ...s };
          next.events = [...next.events, data];

          if (!next.runId && data.runId) next.runId = data.runId;

          switch (data.type) {
            case 'artifact.plan.delta':
              next.planMarkdown += data.delta ?? '';
              break;
            case 'artifact.plan.final':
              if (typeof data.markdown === 'string') next.planMarkdown = data.markdown;
              break;
            case 'artifact.patch.final':
              next.patch = data.patch ?? null;
              break;
            case 'artifact.review.final':
              next.review = data.review ?? null;
              break;
            case 'step.start':
              next.step.currentStepId = data.stepId ?? null;
              if (data.stepId) next.step.steps = upsertStep(next.step.steps, data.stepId, 'running');
              break;
            case 'step.end':
              if (data.stepId) {
                if (next.step.currentStepId === data.stepId) next.step.currentStepId = null;
                next.step.steps = upsertStep(next.step.steps, data.stepId, 'done');
              }
              break;
            case 'run.result':
              next.result = data.result ?? null;
              next.isRunning = false;
              break;
            case 'error':
              next.error = data.message ?? 'Workflow error';
              next.isRunning = false;
              next.step.currentStepId = null;
              break;
            default:
              break;
          }

          return next;
        });
      }
    }

    setState((s) => ({ ...s, isRunning: false }));
  }, [reset]);

  return useMemo(() => ({ state, run, cancel, reset }), [state, run, cancel, reset]);
}
