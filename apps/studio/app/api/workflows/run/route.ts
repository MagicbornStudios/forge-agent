import { NextResponse } from 'next/server';
import { getWorkflow, runWorkflow, toSse } from '@forge/agent-engine';
import { registerForgeWorkflows } from '@forge/domain-forge/workflows';
import type { WorkflowRunInput } from '@forge/shared/copilot/workflows';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

registerForgeWorkflows();

/**
 * @swagger
 * /api/workflows/run:
 *   post:
 *     summary: Run a workflow and stream events over SSE.
 *     tags: [workflows]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: SSE event stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */

function makeRunId(): string {
  return `run_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as WorkflowRunInput;
  const runId = makeRunId();
  const workflowId = body.workflowId;

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const emit = async (event: any) => {
    await writer.write(encoder.encode(toSse(event)));
  };

  (async () => {
    try {
      const workflow = getWorkflow(workflowId);
      const ctx = {
        runId,
        workflowId,
        intent: body.intent,
        domain: body.domain,
        snapshot: body.snapshot,
        selection: body.selection,
        runtime: body.runtime,
      };

      const result = await runWorkflow(workflow as any, ctx as any, body.input ?? {}, emit);

      await emit({
        type: 'run.result',
        runId,
        workflowId,
        result,
        ts: Date.now(),
      });
    } catch (err) {
      await emit({
        type: 'error',
        runId,
        message: err instanceof Error ? err.message : 'Unknown error',
        detail: err,
        ts: Date.now(),
      });
    } finally {
      await writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
