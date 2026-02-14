'use client';

import * as React from 'react';
import type { RepoRunRef } from '@/lib/types';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';

function appendOutput(current: string, ...lines: string[]) {
  return [current, ...lines].filter(Boolean).join('\n');
}

export function useCommandRuns() {
  const [commandOutput, setCommandOutput] = React.useState('No command run yet.');
  const [confirmRuns, setConfirmRuns] = React.useState(true);
  const activeRun = useRepoStudioShellStore((state) => state.activeRun);
  const setActiveRun = useRepoStudioShellStore((state) => state.setActiveRun);
  const runStreamRef = React.useRef<EventSource | null>(null);

  React.useEffect(
    () => () => {
      runStreamRef.current?.close();
    },
    [],
  );

  const runCommand = React.useCallback(async (commandId: string) => {
    runStreamRef.current?.close();
    setActiveRun(null);

    const response = await fetch('/api/repo/runs/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        commandId,
        confirm: confirmRuns,
      }),
    });

    const payload = await response.json().catch(() => ({ ok: false, message: 'Invalid response.' }));
    if (payload.ok !== true || !payload.streamPath) {
      setCommandOutput([
        payload.message || 'Unable to start command run.',
        payload.stderr || '',
      ].filter(Boolean).join('\n\n'));
      return;
    }

    setCommandOutput(`Started ${commandId}\nstream: ${payload.streamPath}`);
    const runRef: RepoRunRef = {
      id: String(payload.run?.id || commandId),
      stopPath: String(payload.stopPath || ''),
    };
    setActiveRun(runRef);

    const stream = new EventSource(payload.streamPath);
    runStreamRef.current = stream;

    stream.addEventListener('snapshot', (event) => {
      const data = JSON.parse((event as MessageEvent).data || '{}');
      setCommandOutput((current) => appendOutput(current, '# snapshot', JSON.stringify(data, null, 2)));
    });

    stream.addEventListener('output', (event) => {
      const data = JSON.parse((event as MessageEvent).data || '{}');
      setCommandOutput((current) => appendOutput(current, data.text || ''));
    });

    stream.addEventListener('end', (event) => {
      const data = JSON.parse((event as MessageEvent).data || '{}');
      setCommandOutput((current) => appendOutput(current, `\n# completed`, JSON.stringify(data, null, 2)));
      setActiveRun(null);
      stream.close();
      if (runStreamRef.current === stream) {
        runStreamRef.current = null;
      }
    });

    stream.addEventListener('error', () => {
      setCommandOutput((current) => appendOutput(current, '\n# stream closed'));
      stream.close();
      if (runStreamRef.current === stream) {
        runStreamRef.current = null;
      }
      setActiveRun(null);
    });
  }, [confirmRuns, setActiveRun]);

  const stopActiveRun = React.useCallback(async () => {
    if (!activeRun?.stopPath) return;
    const response = await fetch(activeRun.stopPath, { method: 'POST' });
    const payload = await response.json().catch(() => ({ ok: false, message: 'Invalid stop response.' }));
    setCommandOutput((current) => appendOutput(current, '\n# stop request', JSON.stringify(payload, null, 2)));
    if (payload.ok) {
      setActiveRun(null);
      runStreamRef.current?.close();
      runStreamRef.current = null;
    }
  }, [activeRun, setActiveRun]);

  return {
    commandOutput,
    setCommandOutput,
    confirmRuns,
    setConfirmRuns,
    activeRun,
    runCommand,
    stopActiveRun,
  };
}

