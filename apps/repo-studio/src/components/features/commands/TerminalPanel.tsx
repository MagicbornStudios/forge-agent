'use client';

import * as React from 'react';
import { LoaderCircle, PlugZap, Square, Trash2 } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import {
  startTerminalSession,
  sendTerminalInput,
  resizeTerminalSession,
  stopTerminalSession,
} from '@/lib/api/services';
import type { TerminalSessionStatus } from '@/lib/api/types';

export function TerminalPanel() {
  const terminalNodeRef = React.useRef<HTMLDivElement | null>(null);
  const terminalRef = React.useRef<any>(null);
  const fitRef = React.useRef<any>(null);
  const streamRef = React.useRef<EventSource | null>(null);
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
  const sessionIdRef = React.useRef<string | null>(null);
  const [session, setSession] = React.useState<TerminalSessionStatus | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('Starting terminal...');

  const disconnectStream = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.close();
      streamRef.current = null;
    }
    setConnected(false);
  }, []);

  const writeTerminal = React.useCallback((text: string) => {
    if (!terminalRef.current || !text) return;
    terminalRef.current.write(text);
  }, []);

  const syncTerminalSize = React.useCallback(async () => {
    if (!fitRef.current || !terminalRef.current) return;
    fitRef.current.fit();
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    try {
      await resizeTerminalSession(sessionId, {
        cols: terminalRef.current.cols,
        rows: terminalRef.current.rows,
      });
    } catch {
      // ignore size sync errors during rapid resizes
    }
  }, []);

  const connectStream = React.useCallback((sessionId: string) => {
    disconnectStream();
    const source = new EventSource(`/api/repo/terminal/session/${sessionId}/stream`);
    streamRef.current = source;

    source.addEventListener('snapshot', (event) => {
      const payload = JSON.parse((event as MessageEvent).data || '{}');
      const nextSession = payload.session as TerminalSessionStatus | undefined;
      setSession(nextSession || null);
      setConnected(true);
      const snapshotMessage = nextSession?.degraded
        ? `Terminal connected (fallback mode).${nextSession.fallbackReason ? ` ${nextSession.fallbackReason}` : ''}`
        : nextSession?.running
          ? 'Terminal connected.'
          : 'Terminal stopped.';
      setStatusMessage(snapshotMessage);
      if (terminalRef.current) {
        terminalRef.current.reset();
        writeTerminal(String(payload.buffer || ''));
      }
      syncTerminalSize().catch(() => {});
    });

    source.addEventListener('output', (event) => {
      const payload = JSON.parse((event as MessageEvent).data || '{}');
      writeTerminal(String(payload.chunk || ''));
    });

    source.addEventListener('exit', (event) => {
      const payload = JSON.parse((event as MessageEvent).data || '{}');
      setSession(payload.session || null);
      setConnected(false);
      setStatusMessage(`Terminal exited${payload.exitCode != null ? ` (${payload.exitCode})` : ''}.`);
      disconnectStream();
    });

    source.onerror = () => {
      setConnected(false);
      setStatusMessage('Terminal stream disconnected.');
    };
  }, [disconnectStream, syncTerminalSize, writeTerminal]);

  const startSession = React.useCallback(async () => {
    setBusy(true);
    try {
      const payload = await startTerminalSession({ reuse: true });
      const nextSession = payload.session || null;
      if (!nextSession?.sessionId) {
        setStatusMessage(payload.message || 'Unable to start terminal session.');
        return;
      }
      sessionIdRef.current = nextSession.sessionId;
      setSession(nextSession);
      setStatusMessage(payload.message || 'Terminal session ready.');
      connectStream(nextSession.sessionId);
    } catch (error: any) {
      setStatusMessage(String(error?.message || error || 'Unable to start terminal session.'));
    } finally {
      setBusy(false);
    }
  }, [connectStream]);

  const stopSession = React.useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    setBusy(true);
    try {
      const payload = await stopTerminalSession(sessionId);
      setStatusMessage(payload.message || 'Terminal session stopped.');
      setSession(payload.session || null);
      disconnectStream();
    } catch (error: any) {
      setStatusMessage(String(error?.message || error || 'Unable to stop terminal session.'));
    } finally {
      setBusy(false);
    }
  }, [disconnectStream]);

  React.useEffect(() => {
    let disposed = false;

    async function setupTerminal() {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ]);
      if (disposed || !terminalNodeRef.current) return;

      const terminal = new Terminal({
        convertEol: true,
        cursorBlink: true,
        fontSize: 12,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        theme: {
          background: '#0b0d10',
          foreground: '#e8eef7',
          cursor: '#60a5fa',
        },
      });
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalNodeRef.current);
      fitAddon.fit();

      terminal.onData((data) => {
        const sessionId = sessionIdRef.current;
        if (!sessionId) return;
        sendTerminalInput(sessionId, data).catch(() => {});
      });

      terminalRef.current = terminal;
      fitRef.current = fitAddon;

      const observer = new ResizeObserver(() => {
        syncTerminalSize().catch(() => {});
      });
      observer.observe(terminalNodeRef.current);
      resizeObserverRef.current = observer;

      startSession().catch(() => {});
    }

    setupTerminal().catch((error) => {
      setStatusMessage(String(error?.message || error || 'Unable to initialize terminal.'));
    });

    return () => {
      disposed = true;
      disconnectStream();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (terminalRef.current) {
        terminalRef.current.dispose();
        terminalRef.current = null;
      }
    };
  }, [disconnectStream, startSession, syncTerminalSize]);

  return (
    <div className="h-full min-h-0 p-2">
      <Card className="h-full min-h-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Terminal</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  terminalRef.current?.clear();
                }}
              >
                <Trash2 className="mr-1 size-3.5" />
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const sessionId = sessionIdRef.current;
                  if (!sessionId) return;
                  connectStream(sessionId);
                }}
                disabled={busy || !sessionIdRef.current}
              >
                <PlugZap className="mr-1 size-3.5" />
                Reconnect
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={stopSession}
                disabled={busy || !session?.running}
              >
                {busy ? <LoaderCircle className="mr-1 size-3.5 animate-spin" /> : <Square className="mr-1 size-3.5" />}
                Stop
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {statusMessage}
            {session?.cwd ? `  cwd: ${session.cwd}` : ''}
          </p>
        </CardHeader>
        <CardContent className="h-[calc(100%-3rem)] min-h-0">
          <div className="h-full min-h-0 overflow-hidden rounded-md border border-border bg-black/90">
            <div ref={terminalNodeRef} className="h-full w-full p-2" />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {connected ? 'stream: connected' : 'stream: disconnected'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

