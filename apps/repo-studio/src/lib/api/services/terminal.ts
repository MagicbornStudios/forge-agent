import { getJson, postJson } from '@/lib/api/http';
import type {
  TerminalSessionInputResponse,
  TerminalSessionListResponse,
  TerminalSessionResizeResponse,
  TerminalSessionStartResponse,
  TerminalSessionStopResponse,
} from '@/lib/api/types';

export async function startTerminalSession(input: {
  reuse?: boolean;
  cwd?: string;
  cols?: number;
  rows?: number;
  command?: string;
  args?: string[];
  profileId?: string;
  name?: string;
  setActive?: boolean;
} = {}) {
  return postJson<TerminalSessionStartResponse>('/api/repo/terminal/session/start', input, {
    fallbackMessage: 'Unable to start terminal session.',
  });
}

export async function fetchTerminalSessions() {
  return getJson<TerminalSessionListResponse>('/api/repo/terminal/session/list', {
    fallbackMessage: 'Unable to list terminal sessions.',
  });
}

export async function sendTerminalInput(sessionId: string, data: string) {
  return postJson<TerminalSessionInputResponse>(`/api/repo/terminal/session/${sessionId}/input`, { data }, {
    fallbackMessage: 'Unable to send terminal input.',
  });
}

export async function resizeTerminalSession(sessionId: string, input: { cols: number; rows: number }) {
  return postJson<TerminalSessionResizeResponse>(`/api/repo/terminal/session/${sessionId}/resize`, input, {
    fallbackMessage: 'Unable to resize terminal session.',
  });
}

export async function stopTerminalSession(sessionId: string) {
  return postJson<TerminalSessionStopResponse>(`/api/repo/terminal/session/${sessionId}/stop`, {}, {
    fallbackMessage: 'Unable to stop terminal session.',
  });
}
