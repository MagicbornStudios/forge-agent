import { getRepoRun, serializeRun } from '@/lib/run-manager';

const encoder = new TextEncoder();

function toSse(event: string, payload: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ runId: string }> },
) {
  const params = await context.params;
  const runId = String(params.runId || '').trim();
  const run = getRepoRun(runId);

  if (!run) {
    return new Response(JSON.stringify({ ok: false, message: `Unknown run id: ${runId}` }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(toSse('snapshot', serializeRun(run)));

      const onOutput = (entry: unknown) => {
        controller.enqueue(toSse('output', entry));
      };
      const onEnd = (entry: unknown) => {
        run.emitter.off('output', onOutput);
        run.emitter.off('end', onEnd);
        controller.enqueue(toSse('end', entry));
        controller.close();
      };

      run.emitter.on('output', onOutput);
      run.emitter.on('end', onEnd);
      cleanup = () => {
        run.emitter.off('output', onOutput);
        run.emitter.off('end', onEnd);
      };

      if (run.status !== 'running') {
        run.emitter.off('output', onOutput);
        run.emitter.off('end', onEnd);
        controller.enqueue(toSse('end', serializeRun(run)));
        controller.close();
      }
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}
