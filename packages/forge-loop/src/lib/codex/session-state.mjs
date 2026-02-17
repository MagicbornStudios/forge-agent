let activeSession = null;

export function getCodexSessionState() {
  return activeSession;
}

export function setCodexSessionState(session) {
  activeSession = session;
  return activeSession;
}

export function clearCodexSessionState() {
  activeSession = null;
}
