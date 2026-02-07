'use client';

import React, { useMemo, useState } from 'react';
import { PlanCard, PlanActionBar, type PlanStepItem } from '@forge/shared/copilot/generative-ui';
import { Button } from '@forge/ui/button';
import { Textarea } from '@forge/ui/textarea';
import { Badge } from '@forge/ui/badge';
import { Label } from '@forge/ui/label';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@forge/ui/card';
import { ItemGroup, Item, ItemContent, ItemTitle, ItemDescription } from '@forge/ui/item';
import { useWorkflowRun } from '@/lib/ai';
import type { Selection } from '@forge/shared';
import type { AIHighlightPayload } from '@forge/shared/copilot/types';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@forge/types/graph';

export interface AgentWorkflowPanelProps {
  graph: ForgeGraphDoc | null;
  selection: Selection | null;
  toolsEnabled: boolean;
  applyOperations: (ops: ForgeGraphPatchOp[]) => void;
  commitGraph: () => Promise<void>;
  onAIHighlight: (payload: AIHighlightPayload) => void;
  onApplyingChange?: (isApplying: boolean) => void;
}

function parsePlanSteps(markdown: string): PlanStepItem[] {
  const lines = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '));

  return lines.map((line) => ({
    title: line.replace(/^\-\s+/, ''),
  }));
}

export function AgentWorkflowPanel({
  graph,
  selection,
  toolsEnabled,
  applyOperations,
  commitGraph,
  onAIHighlight,
  onApplyingChange,
}: AgentWorkflowPanelProps) {
  const [intent, setIntent] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { state, run, cancel, reset } = useWorkflowRun();

  const steps = useMemo(() => parsePlanSteps(state.planMarkdown), [state.planMarkdown]);
  const planStatus = state.error
    ? 'error'
    : state.isRunning
      ? 'inProgress'
      : state.planMarkdown
        ? 'complete'
        : 'idle';

  const canRun = !!graph && toolsEnabled && !state.isRunning;

  const handleRun = async () => {
    if (!graph) return;
    await run({
      workflowId: 'forge.planExecuteReviewCommit',
      domain: 'forge',
      intent: intent.trim() || 'Propose the next small improvement to this graph.',
      input: { graphId: graph.id },
      snapshot: graph,
      selection,
    });
  };

  const handleAccept = async () => {
    if (!state.patch || state.patch.kind !== 'reactflow' || !Array.isArray(state.patch.ops)) return;
    if (state.review && state.review.ok === false) return;
    setIsApplying(true);
    onApplyingChange?.(true);
    try {
      const ops = state.patch.ops as ForgeGraphPatchOp[];
      applyOperations(ops);
      const highlight = buildHighlightFromPatch(ops);
      if (highlight) onAIHighlight(highlight);
      await commitGraph();
      reset();
    } finally {
      setIsApplying(false);
      onApplyingChange?.(false);
    }
  };

  const hasPlan = state.planMarkdown.length > 0 || state.isRunning;
  const hasPatch = !!state.patch;
  return (
    <div className="space-y-3">
      <Card className="bg-muted/10 text-xs shadow-none">
        <CardHeader className="p-[var(--panel-padding)] pb-2">
          <CardTitle className="text-xs">AI intent</CardTitle>
          <CardDescription className="text-[11px]">
            Describe the change you want to plan and propose.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-[var(--panel-padding)] pb-[var(--panel-padding)] pt-0 space-y-2">
          <Label htmlFor="forge-ai-intent" className="text-xs text-muted-foreground">
            Prompt
          </Label>
          <Textarea
            id="forge-ai-intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe the change you want to plan and propose"
            className="min-h-[72px] text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleRun} disabled={!canRun}>
              {state.isRunning ? 'Running...' : 'Run workflow'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancel}
              disabled={!state.isRunning}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              disabled={state.isRunning}
              className="border-border text-foreground"
            >
              Reset
            </Button>
            {!toolsEnabled && (
              <Badge variant="outline" className="text-xs">
                AI tools disabled
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {hasPlan && (
        <PlanCard
          title="Plan"
          summary={intent.trim() || undefined}
          steps={steps}
          status={planStatus}
          footer={
            hasPatch ? (
              <PlanActionBar
                onAccept={handleAccept}
                onReject={reset}
                acceptLabel={isApplying ? 'Applying...' : 'Apply + commit'}
                rejectLabel="Discard"
                disabled={isApplying}
              />
            ) : undefined
          }
        />
      )}

      {state.patch && (
        <Card className="bg-muted/10 text-xs shadow-none">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs">Patch</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {Array.isArray(state.patch.ops) ? state.patch.ops.length : 0} ops
              </Badge>
            </div>
            <CardDescription className="text-[11px]">{state.patch.summary}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <ItemGroup className="gap-2">
              {(Array.isArray(state.patch.ops) ? state.patch.ops : []).map((op, index) => {
                const item = describePatchOp(op as ForgeGraphPatchOp);
                return (
                  <Item
                    key={`${item.title}-${index}`}
                    variant="outline"
                    size="sm"
                    className="bg-background/50"
                  >
                    <ItemContent>
                      <ItemTitle className="text-[11px]">{item.title}</ItemTitle>
                      {item.detail && (
                        <ItemDescription className="text-[11px]">{item.detail}</ItemDescription>
                      )}
                    </ItemContent>
                  </Item>
                );
              })}
            </ItemGroup>
          </CardContent>
        </Card>
      )}

      {state.review && (
        <Card className="bg-muted/10 text-xs shadow-none">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs">Review</CardTitle>
              <Badge variant={state.review.ok ? 'outline' : 'destructive'} className="text-[10px]">
                {state.review.ok ? 'OK' : 'Needs attention'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            {state.review.errors && state.review.errors.length > 0 && (
              <div className="text-destructive">
                {state.review.errors.join(' | ')}
              </div>
            )}
            {state.review.warnings && state.review.warnings.length > 0 && (
              <div className="mt-2 text-muted-foreground">
                {state.review.warnings.join(' | ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function buildHighlightFromPatch(ops: ForgeGraphPatchOp[]): AIHighlightPayload | null {
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  for (const op of ops) {
    switch (op.type) {
      case 'createNode':
        if (op.id) nodeIds.add(op.id);
        break;
      case 'updateNode':
      case 'deleteNode':
      case 'moveNode':
        nodeIds.add(op.nodeId);
        break;
      case 'createEdge':
        nodeIds.add(op.source);
        nodeIds.add(op.target);
        break;
      case 'deleteEdge':
        edgeIds.add(op.edgeId);
        break;
      default:
        break;
    }
  }

  const entities: Record<string, string[]> = {};
  if (nodeIds.size > 0) entities['forge.node'] = Array.from(nodeIds);
  if (edgeIds.size > 0) entities['forge.edge'] = Array.from(edgeIds);

  return Object.keys(entities).length > 0 ? { entities } : null;
}

function describePatchOp(op: ForgeGraphPatchOp): { title: string; detail?: string } {
  switch (op.type) {
    case 'createNode': {
      const label = op.data?.label ? ` "${op.data.label}"` : '';
      return {
        title: `Create node: ${op.nodeType}${label}`,
        detail: `Position (${Math.round(op.position.x)}, ${Math.round(op.position.y)})`,
      };
    }
    case 'updateNode': {
      const keys = Object.keys(op.updates ?? {});
      return {
        title: `Update node: ${op.nodeId}`,
        detail: keys.length ? `Fields: ${keys.join(', ')}` : 'No field updates',
      };
    }
    case 'deleteNode':
      return { title: `Delete node: ${op.nodeId}` };
    case 'moveNode':
      return {
        title: `Move node: ${op.nodeId}`,
        detail: `Position (${Math.round(op.position.x)}, ${Math.round(op.position.y)})`,
      };
    case 'createEdge':
      return { title: `Create edge: ${op.source} -> ${op.target}` };
    case 'deleteEdge':
      return { title: `Delete edge: ${op.edgeId}` };
    default:
      return { title: 'Unknown operation' };
  }
}
