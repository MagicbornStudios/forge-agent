/**
 * Dev-only: append client log entries to LOG_FILE.
 * Guard: NODE_ENV === 'development' and ALLOW_CLIENT_LOG=1.
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED =
  process.env.NODE_ENV === 'development' && process.env.ALLOW_CLIENT_LOG === '1';

export async function POST(req: Request) {
  if (!ALLOWED) {
    return new NextResponse(null, { status: 404 });
  }

  const logFile = process.env.LOG_FILE?.trim();
  if (!logFile) {
    return NextResponse.json({ error: 'LOG_FILE not set' }, { status: 400 });
  }

  let body: { level?: string; message?: string; namespace?: string; entries?: unknown[]; [key: string]: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const entries: Array<Record<string, unknown>> = Array.isArray(body.entries)
    ? (body.entries as Array<Record<string, unknown>>)
    : [body];

  const lines = entries.map((e) => {
    const level = typeof e.level === 'string' ? e.level : 'info';
    const message = typeof e.message === 'string' ? e.message : '';
    const namespace = typeof e.namespace === 'string' ? e.namespace : 'client';
    const { level: _l, message: _m, namespace: _n, meta: _meta, ...rest } = e;
    const meta = _meta && typeof _meta === 'object' && !Array.isArray(_meta) ? (_meta as Record<string, unknown>) : rest;
    return (
      JSON.stringify({
        level,
        message,
        namespace,
        ...meta,
        client: true,
        ts: new Date().toISOString(),
      }) + '\n'
    );
  });

  try {
    const dir = path.dirname(logFile);
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(logFile, lines.join(''));
  } catch {
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
