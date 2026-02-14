import { NextResponse } from 'next/server';

import {
  createTurnStream,
  snapshotTurnEvents,
  subscribeTurnEvents,
  type CodexTurnStreamEvent,
} from '@/lib/codex-session';

export const runtime = 'nodejs';

function toSseFrame(event: CodexTurnStreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const turnId = String(url.searchParams.get('turnId') || '').trim();
  if (!turnId) {
    return NextResponse.json({ ok: false, message: 'turnId is required.' }, { status: 400 });
  }

  const turn = createTurnStream(turnId);
  if (!turn) {
    return NextResponse.json({ ok: false, message: `Unknown turnId: ${turnId}` }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const snapshot = snapshotTurnEvents(turnId);
      for (const event of snapshot) {
        controller.enqueue(encoder.encode(toSseFrame(event)));
      }

      const unsubscribe = subscribeTurnEvents(turnId, (event) => {
        controller.enqueue(encoder.encode(toSseFrame(event)));
        if (event.type === 'finished') {
          unsubscribe?.();
          controller.close();
        }
      });

      if (turn.status !== 'running') {
        unsubscribe?.();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}
