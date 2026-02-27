'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, LoaderCircle, Plus, Square, TerminalSquare } from 'lucide-react';
import { Button } from '@forge/ui/button';
import {
  fetchTerminalSessions,
  resizeTerminalSession,
  sendTerminalInput,
  startTerminalSession,
  stopTerminalSession,
} from '@/lib/api/services';
import type { TerminalSessionStatus } from '@/lib/api/types';

export type TerminalLaunchProfile = {
  profileId: string;
  name?: string;
  command?: string;
  args?: string[];
};

export type TerminalLaunchRequest = TerminalLaunchProfile & {
  requestId: number;
};

export interface GlobalTerminalDockProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  launchRequest: TerminalLaunchRequest | null;
  cwd?: string | null;
}

function upsertSession(nextSessions: TerminalSessionStatus[], session: TerminalSessionStatus) {
  const map = new Map<string, TerminalSessionStatus>();
  for (const existing of nextSessions) {
    map.set(String(existing.sessionId), existing);
  }
  map.set(String(session.sessionId), session);
  return [...map.values()];
}

export function GlobalTerminalDock({
  open,
  onOpenChange,
  launchRequest,
  cwd,
}: GlobalTerminalDockProps) {
  const terminalNodeRef = React.useRef<HTMLDivElement | null>(null);
  const terminalRef = React.useRef<any>(null);
  const fitRef = React.useRef<any>(null);
  const streamRef = React.useRef<EventSource | null>(null);
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
  const [sessions, setSessions] = React.useState<TerminalSessionStatus[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('Terminal ready.');
  const lastLaunchRequestIdRef = React.useRef<number>(0);

  const activeSession = React.useMemo(
    () => sessions.find((session) => session.sessionId === activeSessionId) || null,
    [activeSessionId, sessions],
  );

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

  const syncTerminalSize = React.useCallback(async (sessionId: string | null) => {
    if (!fitRef.current || !terminalRef.current || !sessionId) return;
    fitRef.current.fit();
    try {
      await resizeTerminalSession(sessionId, {
        cols: terminalRef.current.cols,
        rows: terminalRef.current.rows,
      });
    } catch {
      // ignore rapid resize failures
    }
  }, []);

  const refreshSessions = React.useCallback(async () => {
    try {
      const payload = await fetchTerminalSessions();
      if (!payload.ok) return;
      const nextSessions = Array.isArray(payload.sessions) ? payload.sessions : [];
      setSessions(nextSessions);
      const activeFromServer = payload.activeSessionId ? String(payload.activeSessionId) : null;
      setActiveSessionId((current) => {
        if (current && nextSessions.some((session) => session.sessionId === current)) return current;
        if (activeFromServer && nextSessions.some((session) => session.sessionId === activeFromServer)) return activeFromServer;
        return nextSessions[0]?.sessionId || null;
      });
    } catch {
      // ignore refresh failures
    }
  }, []);

  const startProfile = React.useCallback(async (profile: TerminalLaunchProfile) => {
    setBusy(true);
    try {
      const payload = await startTerminalSession({
        reuse: false,
        cwd: String(cwd || '').trim() || undefined,
        command: profile.command,
        args: profile.args,
        profileId: profile.profileId,
        name: profile.name,
        setActive: true,
      });
      if (!payload.ok || !payload.session?.sessionId) {
        setStatusMessage(payload.message || 'Unable to start terminal session.');
        return;
      }
      const session = payload.session;
      setSessions((prev) => upsertSession(prev, session));
      setActiveSessionId(String(session.sessionId));
      setStatusMessage(payload.message || 'Terminal session started.');
      onOpenChange(true);
    } catch (error: any) {
      setStatusMessage(String(error?.message || error || 'Unable to start terminal session.'));
    } finally {
      setBusy(false);
    }
  }, [cwd, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;
    refreshSessions().catch(() => {});
  }, [open, refreshSessions]);

  React.useEffect(() => {
    if (!open || !launchRequest) return;
    if (launchRequest.requestId <= lastLaunchRequestIdRef.current) return;
    lastLaunchRequestIdRef.current = launchRequest.requestId;
    startProfile({
      profileId: launchRequest.profileId,
      name: launchRequest.name,
      command: launchRequest.command,
      args: launchRequest.args,
    }).catch(() => {});
  }, [launchRequest, open, startProfile]);

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
        if (!activeSessionId) return;
        sendTerminalInput(activeSessionId, data).catch(() => {});
      });

      terminalRef.current = terminal;
      fitRef.current = fitAddon;

      const observer = new ResizeObserver(() => {
        syncTerminalSize(activeSessionId).catch(() => {});
      });
      observer.observe(terminalNodeRef.current);
      resizeObserverRef.current = observer;
    }
    setupTerminal().catch((error) => {
      setStatusMessage(String(error?.message || error || 'Unable to initialize terminal UI.'));
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
  }, [activeSessionId, disconnectStream, syncTerminalSize]);

  React.useEffect(() => {
    if (!open || !activeSessionId) return;
    disconnectStream();
    const source = new EventSource(`/api/repo/terminal/session/${activeSessionId}/stream`);
    streamRef.current = source;

    source.addEventListener('snapshot', (event) => {
      const payload = JSON.parse((event as MessageEvent).data || '{}');
      const nextSession = payload.session as TerminalSessionStatus | undefined;
      if (nextSession) {
        setSessions((prev) => upsertSession(prev, nextSession));
      }
      if (terminalRef.current) {
        terminalRef.current.reset();
        writeTerminal(String(payload.buffer || ''));
      }
      setConnected(true);
      setStatusMessage(nextSession?.running ? 'Terminal connected.' : 'Terminal stopped.');
      syncTerminalSize(activeSessionId).catch(() => {});
    });

    source.addEventListener('output', (event) => {
      const payload = JSON.parse((event as MessageEvent).data || '{}');
      writeTerminal(String(payload.chunk || ''));
    });

    source.addEventListener('exit', (event) => {
      const payload = JSON.parse((event as MessageEvent).data || '{}');
      const nextSession = payload.session as TerminalSessionStatus | undefined;
      if (nextSession) {
        setSessions((prev) => upsertSession(prev, nextSession));
      }
      setConnected(false);
      setStatusMessage(`Terminal exited${payload.exitCode != null ? ` (${payload.exitCode})` : ''}.`);
    });

    source.onerror = () => {
      setConnected(false);
      setStatusMessage('Terminal stream disconnected.');
    };

    return () => {
      source.close();
      if (streamRef.current === source) {
        streamRef.current = null;
      }
    };
  }, [activeSessionId, disconnectStream, open, syncTerminalSize, writeTerminal]);

  const stopActiveSession = React.useCallback(async () => {
    if (!activeSessionId) return;
    setBusy(true);
    try {
      const payload = await stopTerminalSession(activeSessionId);
      setStatusMessage(payload.message || 'Terminal stopped.');
      setSessions((prev) => prev.filter((session) => session.sessionId !== activeSessionId));
      setActiveSessionId((current) => {
        if (current !== activeSessionId) return current;
        const remaining = sessions.filter((session) => session.sessionId !== activeSessionId);
        return remaining[0]?.sessionId || null;
      });
      await refreshSessions();
    } catch (error: any) {
      setStatusMessage(String(error?.message || error || 'Unable to stop terminal.'));
    } finally {
      setBusy(false);
    }
  }, [activeSessionId, refreshSessions, sessions]);

  return (
    <div className="border-t border-border bg-background/90">
      <div className="flex items-center justify-between gap-2 px-2 py-1">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => onOpenChange(!open)}
          >
            <TerminalSquare className="mr-1 size-3.5" />
            Terminal
            {open ? <ChevronDown className="ml-1 size-3.5" /> : <ChevronUp className="ml-1 size-3.5" />}
          </Button>
          {open ? (
            <>
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => startProfile({ profileId: 'shell', name: 'Shell' })}>
                <Plus className="mr-1 size-3.5" />
                New
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => startProfile({ profileId: 'codex', name: 'Codex CLI', command: 'codex' })}>
                Codex
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => startProfile({ profileId: 'claude', name: 'Claude Code CLI', command: 'claude' })}>
                Claude
              </Button>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {busy ? <LoaderCircle className="size-3 animate-spin" /> : null}
          <span>{statusMessage}</span>
          {open ? (
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2"
              onClick={stopActiveSession}
              disabled={!activeSessionId || busy || !activeSession?.running}
            >
              <Square className="mr-1 size-3.5" />
              Stop
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="border-t border-border">
          <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-1">
            {sessions.map((session) => {
              const active = session.sessionId === activeSessionId;
              return (
                <Button
                  key={session.sessionId}
                  size="sm"
                  variant={active ? 'secondary' : 'ghost'}
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setActiveSessionId(session.sessionId)}
                >
                  {session.name || session.profileId || 'Terminal'}
                </Button>
              );
            })}
            {sessions.length === 0 ? (
              <span className="text-[11px] text-muted-foreground">No sessions yet. Use New/Codex/Claude.</span>
            ) : null}
          </div>
          <div className="h-64 min-h-0 overflow-hidden bg-black/90">
            <div ref={terminalNodeRef} className="h-full w-full p-2" />
          </div>
          <div className="px-2 py-1 text-[10px] text-muted-foreground">
            {connected ? 'stream: connected' : 'stream: disconnected'}
          </div>
        </div>
      ) : null}
    </div>
  );
}
