import type { ForgeGraphPatchOp, ForgeNodeType } from '@forge/types/graph';

export type ForgePlanStep = Record<string, unknown>;

export function planStepToOp(step: ForgePlanStep): ForgeGraphPatchOp | null {
  const type = String(step.type ?? '');
  if (type === 'createEdge') {
    const source = step.source ?? step.sourceNodeId;
    const target = step.target ?? step.targetNodeId;
    if (source != null && target != null) {
      return { type: 'createEdge', source: String(source), target: String(target) };
    }
    return null;
  }
  if (type === 'updateNode' && step.nodeId != null) {
    return {
      type: 'updateNode',
      nodeId: String(step.nodeId),
      updates: (step.updates as Record<string, unknown>) ?? {},
    };
  }
  if (type === 'deleteNode' && step.nodeId != null) {
    return { type: 'deleteNode', nodeId: String(step.nodeId) };
  }
  if (type === 'createNode') {
    const providedId =
      typeof step.id === 'string' && step.id.trim().length > 0
        ? step.id.trim()
        : null;
    const nodeId =
      providedId ??
      `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    return {
      type: 'createNode',
      nodeType: (step.nodeType as ForgeNodeType) ?? 'CHARACTER',
      position: {
        x: typeof step.x === 'number' ? step.x : Math.random() * 400,
        y: typeof step.y === 'number' ? step.y : Math.random() * 400,
      },
      data: {
        label: step.label as string | undefined,
        content: step.content as string | undefined,
        speaker: step.speaker as string | undefined,
      },
      id: nodeId,
    };
  }
  return null;
}

export function planStepsToOps(steps: ForgePlanStep[]): ForgeGraphPatchOp[] {
  return steps
    .map((step) => planStepToOp(step))
    .filter((op): op is ForgeGraphPatchOp => Boolean(op));
}

export function describePlanStep(step: ForgePlanStep): { title: string; description?: string; meta?: string } {
  const type = String(step.type ?? '').trim();
  if (type === 'createNode') {
    const label = step.label ? `"${String(step.label)}"` : 'node';
    const nodeType = step.nodeType ? String(step.nodeType) : 'CHARACTER';
    const speaker = step.speaker ? `Speaker: ${String(step.speaker)}` : undefined;
    return {
      title: `Create ${nodeType} ${label}`,
      description: speaker ?? (step.content ? `Content: ${String(step.content)}` : undefined),
      meta: 'create',
    };
  }
  if (type === 'createEdge') {
    const source = step.source ?? step.sourceNodeId;
    const target = step.target ?? step.targetNodeId;
    return {
      title: `Connect ${String(source)} -> ${String(target)}`,
      description: 'Create a new edge between nodes.',
      meta: 'edge',
    };
  }
  if (type === 'updateNode') {
    const updates = typeof step.updates === 'object' && step.updates ? Object.keys(step.updates) : [];
    return {
      title: `Update node ${String(step.nodeId)}`,
      description: updates.length ? `Fields: ${updates.join(', ')}` : undefined,
      meta: 'update',
    };
  }
  if (type === 'deleteNode') {
    return {
      title: `Delete node ${String(step.nodeId)}`,
      description: 'Remove node and connected edges.',
      meta: 'delete',
    };
  }
  return {
    title: type ? `Step: ${type}` : 'Unknown step',
    description: step ? JSON.stringify(step) : undefined,
    meta: 'plan',
  };
}
