import {
  getTerminalSession,
  subscribeTerminalSession,
} from '@/lib/terminal-session';

export const runtime = 'nodejs';

const encoder = new TextEncoder();

function toSse(event: string, payload: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const params = await context.params;
  const sessionId = String(params.sessionId || '').trim();
  const snapshot = getTerminalSession(sessionId);

  if (!snapshot) {
    return new Response(JSON.stringify({ ok: false, message: `Unknown terminal session: ${sessionId}` }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(toSse('snapshot', {
        session: snapshot.session,
        buffer: snapshot.buffer,
      }));

      const unsubscribe = subscribeTerminalSession(sessionId, {
        onOutput: (chunk) => {
          controller.enqueue(toSse('output', { chunk }));
        },
        onExit: (payload) => {
          controller.enqueue(toSse('exit', payload));
          controller.close();
        },
      });

      if (!unsubscribe) {
        controller.enqueue(toSse('exit', {
          exitCode: snapshot.session.exitCode,
          session: snapshot.session,
        }));
        controller.close();
        return;
      }

      cleanup = unsubscribe;
      if (!snapshot.session.running) {
        controller.enqueue(toSse('exit', {
          exitCode: snapshot.session.exitCode,
          session: snapshot.session,
        }));
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
