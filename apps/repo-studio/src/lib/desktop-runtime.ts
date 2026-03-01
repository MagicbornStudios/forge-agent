export type DesktopRuntimeEvent = {
  type: string;
  timestamp?: string;
  eventName?: string;
  path?: string;
  status?: string;
  reason?: string;
  watchedRoots?: string[];
  polling?: boolean;
};

export type DesktopWindowState = {
  customFrame: boolean;
  platform: string;
  isMaximized: boolean;
  isMinimized: boolean;
  isFocused: boolean;
};

export type DesktopAuthStatus = {
  ok: boolean;
  connected: boolean;
  baseUrl: string;
  provider: 'keytar' | 'safeStorage' | 'memory' | string;
  lastValidatedAt: string | null;
  capabilities: {
    connect: boolean;
    read: boolean;
    write: boolean;
  };
  message?: string;
  status?: number;
  authType?: 'api_key' | 'session' | string;
  userId?: number | null;
  organizationId?: number | null;
  scopes?: string[];
  serverTime?: string | null;
};

export type DesktopRuntimeBridge = {
  subscribeRuntimeEvents: (listener: (event: DesktopRuntimeEvent) => void) => () => void;
  subscribeWindowState?: (listener: (state: DesktopWindowState) => void) => () => void;
  runtimeStatus?: () => Promise<unknown>;
  stopRuntime?: () => Promise<unknown>;
  windowState?: () => Promise<DesktopWindowState>;
  windowMinimize?: () => Promise<DesktopWindowState>;
  windowToggleMaximize?: () => Promise<DesktopWindowState>;
  windowClose?: () => Promise<{ ok: boolean }>;
  pickProjectFolder?: () => Promise<{
    ok: boolean;
    canceled?: boolean;
    path?: string;
    message?: string;
  }>;
  authStatus?: () => Promise<DesktopAuthStatus>;
  authConnect?: (payload: { baseUrl: string; token: string }) => Promise<DesktopAuthStatus>;
  authDisconnect?: () => Promise<DesktopAuthStatus>;
  authValidate?: (payload?: { baseUrl?: string; token?: string }) => Promise<DesktopAuthStatus>;
};

declare global {
  interface Window {
    repoStudioDesktop?: DesktopRuntimeBridge;
  }
}

export function getDesktopRuntimeBridge(): DesktopRuntimeBridge | null {
  if (typeof window === 'undefined') return null;
  const bridge = window.repoStudioDesktop;
  if (!bridge || typeof bridge.subscribeRuntimeEvents !== 'function') return null;
  return bridge;
}
