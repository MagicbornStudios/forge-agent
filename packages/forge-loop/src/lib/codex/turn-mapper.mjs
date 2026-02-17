function textFromUnknown(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => textFromUnknown(item)).filter(Boolean).join('\n');
  if (typeof value !== 'object') return '';

  const record = value;
  for (const key of ['text', 'delta', 'message', 'content', 'summary']) {
    if (record[key] != null) {
      const nested = textFromUnknown(record[key]);
      if (nested) return nested;
    }
  }
  return '';
}

function collectPaths(input) {
  const results = new Set();
  const queue = [input];

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) continue;

    if (Array.isArray(next)) {
      for (const item of next) queue.push(item);
      continue;
    }

    if (typeof next !== 'object') continue;
    const record = next;
    for (const key of ['path', 'filePath', 'targetPath', 'file']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        results.add(value.trim());
      }
    }

    for (const nested of Object.values(record)) {
      if (nested && (typeof nested === 'object' || Array.isArray(nested))) {
        queue.push(nested);
      }
    }
  }

  return [...results];
}

function extractTurnId(value) {
  if (!value || typeof value !== 'object') return null;
  for (const key of ['turnId', 'turn_id', 'id']) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (typeof candidate === 'number') return String(candidate);
  }

  if (value.turn && typeof value.turn === 'object') {
    const nested = value.turn.id || value.turn.turnId;
    if (typeof nested === 'string' && nested.trim()) return nested.trim();
    if (typeof nested === 'number') return String(nested);
  }

  return null;
}

export function mapCodexNotification(notification = {}) {
  const method = String(notification.method || '').trim();
  const params = notification.params || {};
  const lower = method.toLowerCase();

  const text = textFromUnknown(params).trim();
  const filesTouched = collectPaths(params);
  const turnId = extractTurnId(params);

  let status = 'running';
  let eventType = 'turn-event';

  if (lower === 'turn/completed') {
    status = 'completed';
    eventType = 'task-complete';
  } else if (lower === 'turn/failed' || lower === 'turn/error') {
    status = 'failed';
    eventType = 'task-blocked';
  }

  return {
    method,
    turnId,
    status,
    text,
    filesTouched,
    eventType,
    payload: params,
  };
}

export function extractTurnIdentifier(result = {}) {
  return extractTurnId(result) || null;
}
