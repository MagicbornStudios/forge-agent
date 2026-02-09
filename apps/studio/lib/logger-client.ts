/**
 * Client-side logger: when NEXT_PUBLIC_LOG_TO_SERVER=1 (and dev), sends logs to POST /api/dev/log
 * so they appear in the same LOG_FILE. Otherwise no-op or console fallback.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SEND_TO_SERVER = process.env.NEXT_PUBLIC_LOG_TO_SERVER === '1';

const BATCH_MS = 500;
type BatchEntry = { level: string; message: string; namespace: string; meta: Record<string, unknown> };
let batch: BatchEntry[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (batch.length === 0) return;
  const payload = [...batch];
  batch = [];
  batchTimer = null;
  const body =
    payload.length === 1
      ? { level: payload[0].level, message: payload[0].message, namespace: payload[0].namespace, ...payload[0].meta }
      : { entries: payload };
  fetch('/api/dev/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}

function enqueue(level: LogLevel, message: string, namespace: string, meta: Record<string, unknown>) {
  if (!SEND_TO_SERVER) return;
  batch.push({ level, message, namespace, meta });
  if (!batchTimer) batchTimer = setTimeout(flush, BATCH_MS);
}

/**
 * Log from the client. When NEXT_PUBLIC_LOG_TO_SERVER=1, sends to server to append to LOG_FILE.
 * Use sparingly (e.g. "Copilot opened", "model switch requested").
 */
export function log(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
  namespace = 'client',
) {
  const safeMeta = meta && typeof meta === 'object' ? meta : {};
  if (SEND_TO_SERVER) {
    enqueue(level, message, namespace, safeMeta);
  } else if (level === 'error' && typeof console !== 'undefined' && console.error) {
    console.error(`[${namespace}]`, message, safeMeta);
  }
}

export const clientLogger = {
  debug: (msg: string, meta?: Record<string, unknown>, ns?: string) => log('debug', msg, meta, ns),
  info: (msg: string, meta?: Record<string, unknown>, ns?: string) => log('info', msg, meta, ns),
  warn: (msg: string, meta?: Record<string, unknown>, ns?: string) => log('warn', msg, meta, ns),
  error: (msg: string, meta?: Record<string, unknown>, ns?: string) => log('error', msg, meta, ns),
};
