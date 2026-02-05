import type { Workflow, WorkflowContext, Emit, WorkflowRunResult } from '@forge/agent-engine';
import type { PatchEnvelope, ReviewResult } from '@forge/shared/copilot/workflows/patch';
import { FORGE_NODE_TYPE, type ForgeGraphDoc, type ForgeGraphPatchOp } from '@forge/types/graph';

export type ForgeWorkflowInput = {
  graphId: string | number;
};

function now(): number {
  return Date.now();
}

async function emitStep(emit: Emit, runId: string, stepId: string, type: 'start' | 'end') {
  const ts = now();
  await emit(type === 'start'
    ? { type: 'step.start', runId, stepId, ts }
    : { type: 'step.end', runId, stepId, ts }
  );
}

function buildPlanMarkdown(intent: string, selection: unknown): string {
  const selectionHint =
    selection && typeof selection === 'object' && 'entityType' in selection && 'id' in selection
      ? `- Use selection: ${(selection as { entityType?: string; id?: string }).entityType ?? 'entity'} ${(selection as { id?: string }).id ?? ''}`
      : '- No selection provided; propose minimal changes.';

  return [
    '# Plan',
    '',
    `- Understand intent: ${intent || 'No explicit intent provided.'}`,
    selectionHint,
    '- Propose a minimal patch (nodes/edges updates)',
    '- Validate invariants',
    '- Present proposal for review',
  ].join('\n');
}

function pickTargetNodeId(snapshot: unknown, selection: unknown): string | null {
  const sel = selection as { entityType?: string; id?: string } | undefined;
  if (sel && sel.entityType === 'forge.node' && sel.id) return sel.id;
  const graph = snapshot as ForgeGraphDoc | null;
  return graph?.flow.nodes[0]?.id ?? null;
}

function buildPatchCandidate(
  ctx: WorkflowContext,
  input: ForgeWorkflowInput,
  attempt: number
): PatchEnvelope<'reactflow', ForgeGraphPatchOp[]> {
  const ops: ForgeGraphPatchOp[] = [];
  const targetNodeId = pickTargetNodeId(ctx.snapshot, ctx.selection);

  if (targetNodeId && attempt === 0) {
    ops.push({
      type: 'updateNode',
      nodeId: targetNodeId,
      updates: {
        label: ctx.intent ? ctx.intent.slice(0, 40) : 'Updated by AI',
      },
    });
  } else {
    const nodeId = `ai_${ctx.runId}_${attempt}`;
    ops.push({
      type: 'createNode',
      nodeType: FORGE_NODE_TYPE.CHARACTER,
      position: { x: 120 + attempt * 40, y: 120 + attempt * 40 },
      data: {
        label: ctx.intent ? ctx.intent.slice(0, 40) : 'New Character',
      },
      id: nodeId,
    });
  }

  return {
    kind: 'reactflow',
    ops,
    summary: ctx.intent ? `Apply intent: ${ctx.intent}` : 'Apply a minimal graph update',
    meta: { graphId: input.graphId, attempt },
  };
}

async function buildPatchWithLoop(
  ctx: WorkflowContext,
  input: ForgeWorkflowInput,
  emit: Emit
): Promise<PatchEnvelope<'reactflow', ForgeGraphPatchOp[]>> {
  const maxAttempts = 2;
  let lastPatch = buildPatchCandidate(ctx, input, 0);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await emit({
      type: 'step.delta',
      runId: ctx.runId,
      stepId: 'propose',
      channel: 'attempt',
      delta: `Attempt ${attempt + 1} of ${maxAttempts}`,
      ts: now(),
    });

    const patch = buildPatchCandidate(ctx, input, attempt);
    const review = validatePatch(ctx.snapshot, patch);
    lastPatch = patch;

    if (review.ok) {
      return patch;
    }

    if (review.errors && review.errors.length > 0) {
      await emit({
        type: 'step.delta',
        runId: ctx.runId,
        stepId: 'propose',
        channel: 'validation',
        delta: `Validation failed: ${review.errors.join(' | ')}`,
        ts: now(),
      });
    }
  }

  return lastPatch;
}

function validatePatch(snapshot: unknown, patch: PatchEnvelope<'reactflow', ForgeGraphPatchOp[]>): ReviewResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(patch.ops) || patch.ops.length === 0) {
    errors.push('Patch has no operations.');
  }

  const graph = snapshot as ForgeGraphDoc | null;
  if (!graph?.flow?.nodes || !graph?.flow?.edges) {
    errors.push('Graph snapshot missing nodes/edges.');
  }

  const nodeIds = new Set<string>(graph?.flow?.nodes?.map((n) => n.id) ?? []);
  const edgeIds = new Set<string>(graph?.flow?.edges?.map((e) => e.id) ?? []);
  const createdNodeIds = new Set<string>();

  for (const op of patch.ops ?? []) {
    switch (op.type) {
      case 'createNode': {
        if (!op.id) {
          warnings.push('createNode missing id; runtime will generate a node id.');
          break;
        }
        if (nodeIds.has(op.id) || createdNodeIds.has(op.id)) {
          errors.push(`Duplicate node id in patch: ${op.id}`);
          break;
        }
        createdNodeIds.add(op.id);
        nodeIds.add(op.id);
        break;
      }
      case 'deleteNode': {
        if (!nodeIds.has(op.nodeId)) {
          errors.push(`deleteNode refers to missing node: ${op.nodeId}`);
          break;
        }
        nodeIds.delete(op.nodeId);
        break;
      }
      case 'updateNode':
      case 'moveNode': {
        if (!nodeIds.has(op.nodeId)) {
          errors.push(`${op.type} refers to missing node: ${op.nodeId}`);
        }
        break;
      }
      case 'createEdge': {
        const missing: string[] = [];
        if (!nodeIds.has(op.source)) missing.push(op.source);
        if (!nodeIds.has(op.target)) missing.push(op.target);
        if (missing.length > 0) {
          errors.push(`createEdge refers to missing nodes: ${missing.join(', ')}`);
        }
        break;
      }
      case 'deleteEdge': {
        if (!edgeIds.has(op.edgeId)) {
          errors.push(`deleteEdge refers to missing edge: ${op.edgeId}`);
          break;
        }
        edgeIds.delete(op.edgeId);
        break;
      }
      default:
        break;
    }
  }

  return {
    ok: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export const forgePlanExecuteReviewCommit: Workflow<ForgeWorkflowInput> = {
  id: 'forge.planExecuteReviewCommit',
  steps: [
    { id: 'plan', run: async () => undefined },
    { id: 'propose', run: async () => undefined },
    { id: 'review', run: async () => undefined },
    { id: 'commitPayload', run: async () => undefined },
  ],
  async run(ctx: WorkflowContext, input: ForgeWorkflowInput, emit: Emit): Promise<WorkflowRunResult> {
    const trace: Array<{ stepId: string; ms: number }> = [];

    const planMarkdown = buildPlanMarkdown(ctx.intent, ctx.selection);

    {
      const stepId = 'plan';
      const start = now();
      await emitStep(emit, ctx.runId, stepId, 'start');

      for (const line of planMarkdown.split('\n')) {
        await emit({ type: 'artifact.plan.delta', runId: ctx.runId, delta: `${line}\n`, ts: now() });
      }
      await emit({ type: 'artifact.plan.final', runId: ctx.runId, markdown: planMarkdown, ts: now() });

      await emitStep(emit, ctx.runId, stepId, 'end');
      trace.push({ stepId, ms: now() - start });
    }

    let patch: PatchEnvelope<'reactflow', ForgeGraphPatchOp[]>;
    {
      const stepId = 'propose';
      const start = now();
      await emitStep(emit, ctx.runId, stepId, 'start');

      await emit({ type: 'tool.call', runId: ctx.runId, tool: 'forge.proposePatch', input: { intent: ctx.intent }, ts: now() });
      patch = await buildPatchWithLoop(ctx, input, emit);
      await emit({ type: 'tool.result', runId: ctx.runId, tool: 'forge.proposePatch', output: { opCount: patch.ops.length }, ts: now() });

      await emit({ type: 'artifact.patch.final', runId: ctx.runId, patch, ts: now() });
      await emitStep(emit, ctx.runId, stepId, 'end');
      trace.push({ stepId, ms: now() - start });
    }

    let review: ReviewResult;
    {
      const stepId = 'review';
      const start = now();
      await emitStep(emit, ctx.runId, stepId, 'start');

      review = validatePatch(ctx.snapshot, patch);
      await emit({ type: 'artifact.review.final', runId: ctx.runId, review, ts: now() });

      await emitStep(emit, ctx.runId, stepId, 'end');
      trace.push({ stepId, ms: now() - start });
    }

    {
      const stepId = 'commitPayload';
      const start = now();
      await emitStep(emit, ctx.runId, stepId, 'start');
      await emitStep(emit, ctx.runId, stepId, 'end');
      trace.push({ stepId, ms: now() - start });
    }

    return {
      runId: ctx.runId,
      workflowId: ctx.workflowId,
      planMarkdown,
      patch,
      review,
      trace,
    };
  },
};
