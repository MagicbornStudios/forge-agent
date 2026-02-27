/**
 * Structured logger for Studio (env-driven level, optional file, namespaces).
 * Use getLogger('namespace') so logs can be filtered and traced.
 */

import fs from 'fs';
import path from 'path';
import pino from 'pino';

const level = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
const validLevels = ['debug', 'info', 'warn', 'error'] as const;
const logLevel = validLevels.includes(level as (typeof validLevels)[number])
  ? (level as (typeof validLevels)[number])
  : 'info';

const streams: pino.StreamEntry[] = [
  { stream: pino.destination({ dest: 1, sync: false }) },
];
const logFile = process.env.LOG_FILE?.trim();
if (logFile) {
  try {
    const dir = path.dirname(logFile);
    fs.mkdirSync(dir, { recursive: true });
    streams.push({ stream: pino.destination({ dest: logFile, append: true }) });
  } catch {
    // ignore; log to stdout only
  }
}

const base = pino({ level: logLevel }, pino.multistream(streams));

export type Logger = pino.Logger;

export function getLogger(namespace: string): Logger {
  return base.child({ namespace });
}
