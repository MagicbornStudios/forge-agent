import { RUNNER_CODEX } from './contracts.mjs';
import { evaluateCodexRuntimeReadiness } from '../codex/cli-status.mjs';
import { spawnCodexAppServer, stopCodexAppServer } from '../codex/app-server.mjs';
import { CodexProtocolClient } from '../codex/protocol.mjs';
import {
  clearCodexSessionState,
  getCodexSessionState,
  setCodexSessionState,
} from '../codex/session-state.mjs';
import { extractTurnIdentifier, mapCodexNotification } from '../codex/turn-mapper.mjs';

function nowIso() {
  return new Date().toISOString();
}

function isSessionAlive(session) {
  return Boolean(session?.process && !session.process.killed && session?.protocol && session.threadId);
}

async function initializeSession(runtimeSettings) {
  const command = runtimeSettings?.codex?.command || 'codex';
  const child = spawnCodexAppServer({
    command,
    cwd: process.cwd(),
  });
  const protocol = new CodexProtocolClient(child);
  await protocol.initialize({ clientName: 'forge-loop', clientVersion: '1.6.0' });

  const threadResult = await protocol.startThread();
  const threadId = extractTurnIdentifier(threadResult) || String(threadResult?.threadId || threadResult?.id || '');
  if (!threadId) {
    await protocol.close();
    stopCodexAppServer(child);
    throw new Error('Codex thread initialization failed: no thread id returned.');
  }

  const session = {
    process: child,
    protocol,
    threadId,
    startedAt: nowIso(),
  };
  setCodexSessionState(session);
  return session;
}

async function ensureSession(runtimeSettings) {
  const existing = getCodexSessionState();
  if (isSessionAlive(existing)) return existing;
  if (existing) {
    try {
      await existing.protocol?.close();
    } catch {
      // no-op
    }
    stopCodexAppServer(existing.process);
    clearCodexSessionState();
  }
  return initializeSession(runtimeSettings);
}

function waitForTurnCompletion({ protocol, expectedTurnId, writer, timeoutMs = 600000 }) {
  return new Promise((resolve, reject) => {
    let text = '';
    let filesTouched = [];
    let resolved = false;
    const seenFiles = new Set();
    const events = [];
    const startedAt = Date.now();

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Codex turn timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timeout);
      protocol.off('notification', onNotification);
      protocol.off('stderr', onStderr);
      protocol.off('diagnostic', onDiagnostic);
      protocol.off('exit', onExit);
    };

    const complete = (status, reason = '') => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve({
        ok: status === 'completed',
        status,
        reason: reason || null,
        text: text.trim(),
        filesTouched,
        events,
        durationMs: Date.now() - startedAt,
      });
    };

    const onStderr = (line) => {
      writer?.write('turn-event', { stream: 'stderr', line });
      events.push({ stream: 'stderr', line, ts: nowIso() });
    };

    const onDiagnostic = (message) => {
      writer?.write('turn-event', { stream: 'diagnostic', message });
      events.push({ stream: 'diagnostic', message, ts: nowIso() });
    };

    const onExit = () => {
      complete('failed', 'codex app-server exited during turn execution');
    };

    const onNotification = (notification) => {
      const mapped = mapCodexNotification(notification);
      if (mapped.turnId && expectedTurnId && mapped.turnId !== expectedTurnId) return;

      if (mapped.text) {
        text = `${text}\n${mapped.text}`.trim();
      }
      if (Array.isArray(mapped.filesTouched)) {
        for (const filePath of mapped.filesTouched) {
          if (!seenFiles.has(filePath)) {
            seenFiles.add(filePath);
            filesTouched.push(filePath);
          }
        }
      }

      writer?.write('turn-event', {
        method: mapped.method,
        status: mapped.status,
        filesTouched: mapped.filesTouched,
      });
      events.push({
        method: mapped.method,
        status: mapped.status,
        filesTouched: mapped.filesTouched,
        text: mapped.text || '',
        ts: nowIso(),
      });

      if (mapped.status === 'completed') {
        complete('completed');
        return;
      }

      if (mapped.status === 'failed') {
        complete('failed', mapped.text || `${mapped.method} reported failure`);
      }
    };

    protocol.on('notification', onNotification);
    protocol.on('stderr', onStderr);
    protocol.on('diagnostic', onDiagnostic);
    protocol.on('exit', onExit);
  });
}

async function runTurn({ runtimeSettings, stage, prompt, metadata = {}, writer }) {
  const session = await ensureSession(runtimeSettings);
  writer?.write('turn-start', {
    stage,
    threadId: session.threadId,
  });

  const model = String(runtimeSettings?.codex?.defaultModel || 'gpt-5');
  const turnResult = await session.protocol.startTurn({
    threadId: session.threadId,
    cwd: process.cwd(),
    model,
    prompt,
    metadata,
  });
  const turnId = extractTurnIdentifier(turnResult);
  const completion = await waitForTurnCompletion({
    protocol: session.protocol,
    expectedTurnId: turnId,
    writer,
  });

  return {
    ...completion,
    turnId,
  };
}

export async function stopCodexProviderSession() {
  const session = getCodexSessionState();
  if (!session) return;
  clearCodexSessionState();
  try {
    await session.protocol?.close();
  } catch {
    // no-op
  }
  stopCodexAppServer(session.process);
}

export function createCodexProvider(runtimeSettings = null) {
  const readiness = evaluateCodexRuntimeReadiness(runtimeSettings || {});

  return {
    name: RUNNER_CODEX,
    readiness,
    canRun() {
      if (!readiness.ok) {
        return {
          ok: false,
          issues: readiness.issues || ['codex runtime unavailable'],
        };
      }
      return { ok: true, issues: [] };
    },
    async runDiscuss({ prompt, metadata, writer }) {
      return runTurn({
        runtimeSettings,
        stage: 'discuss',
        prompt,
        metadata,
        writer,
      });
    },
    async runPlan({ prompt, metadata, writer }) {
      return runTurn({
        runtimeSettings,
        stage: 'plan',
        prompt,
        metadata,
        writer,
      });
    },
    async runTask({ prompt, metadata, writer }) {
      return runTurn({
        runtimeSettings,
        stage: 'execute',
        prompt,
        metadata,
        writer,
      });
    },
  };
}
