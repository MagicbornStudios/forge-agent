import { createHash } from 'node:crypto';
import path from 'node:path';

import {
  normalizeBaseUrl,
  REPO_STUDIO_CREDENTIAL_SERVICE,
} from './contracts.mjs';
import { createKeytarStore } from './keytar-store.mjs';
import { createSafeStorageStore } from './safestorage-store.mjs';
import { createMemoryStore } from './memory-store.mjs';
import { readDesktopAuthState, writeDesktopAuthState } from './state-file.mjs';

function workspaceFingerprint(workspaceRoot) {
  return createHash('sha256')
    .update(String(workspaceRoot || process.cwd()))
    .digest('hex')
    .slice(0, 24);
}

function normalizeCapabilities(capabilities) {
  return {
    connect: capabilities?.connect === true,
    read: capabilities?.read === true,
    write: capabilities?.write === true,
  };
}

function disconnectedState(provider, message = 'Not connected.') {
  return {
    connected: false,
    baseUrl: '',
    provider,
    lastValidatedAt: null,
    capabilities: {
      connect: false,
      read: false,
      write: false,
    },
    message,
  };
}

function parseCredential(rawSecret) {
  if (!rawSecret) return null;
  try {
    const parsed = JSON.parse(String(rawSecret));
    const baseUrl = normalizeBaseUrl(parsed?.baseUrl);
    const token = String(parsed?.token || '');
    if (!baseUrl || !token) return null;
    return { baseUrl, token };
  } catch {
    return null;
  }
}

export async function createCredentialManager(options = {}) {
  const workspaceRoot = path.resolve(String(options.workspaceRoot || process.cwd()));
  const userDataPath = path.resolve(String(options.userDataPath || path.join(workspaceRoot, '.repo-studio')));
  const statePath = path.resolve(String(
    options.statePath || path.join(workspaceRoot, '.repo-studio', 'desktop-auth-state.json'),
  ));
  const safeStoragePath = path.resolve(String(
    options.safeStoragePath || path.join(userDataPath, 'repo-studio-auth.enc'),
  ));
  const account = String(
    options.account || `workspace-${workspaceFingerprint(workspaceRoot)}`,
  );
  const service = String(options.service || REPO_STUDIO_CREDENTIAL_SERVICE);

  const keytarStore = await createKeytarStore({ service, account });
  const safeStorageStore = createSafeStorageStore({
    filePath: safeStoragePath,
    safeStorage: options.safeStorage,
  });
  const memoryStore = createMemoryStore();
  const activeStore = keytarStore || safeStorageStore || memoryStore;
  const provider = activeStore.name;

  async function readCredential() {
    const secret = await activeStore.read();
    return parseCredential(secret);
  }

  async function readStatus() {
    const credential = await readCredential();
    const state = await readDesktopAuthState(statePath);
    if (!credential) {
      return {
        ok: true,
        ...disconnectedState(provider, state?.message || 'Not connected.'),
      };
    }

    return {
      ok: true,
      connected: true,
      baseUrl: credential.baseUrl,
      provider,
      lastValidatedAt: state?.lastValidatedAt || null,
      capabilities: normalizeCapabilities(state?.capabilities || {}),
      message: String(state?.message || 'Connected.'),
    };
  }

  async function saveCredential(input = {}) {
    const baseUrl = normalizeBaseUrl(input.baseUrl);
    if (!baseUrl) throw new Error('A valid base URL is required.');
    const token = String(input.token || '').trim();
    if (!token) throw new Error('A non-empty API key token is required.');

    await activeStore.write(
      JSON.stringify({
        baseUrl,
        token,
        updatedAt: new Date().toISOString(),
      }),
    );

    const nextState = {
      connected: true,
      baseUrl,
      provider,
      lastValidatedAt: input.lastValidatedAt || null,
      capabilities: normalizeCapabilities(input.capabilities || {}),
      message: String(input.message || 'Connected.'),
    };
    await writeDesktopAuthState(statePath, nextState);

    return readStatus();
  }

  async function updateValidation(input = {}) {
    const credential = await readCredential();
    if (!credential) {
      const state = disconnectedState(provider, 'Not connected.');
      await writeDesktopAuthState(statePath, state);
      return { ok: true, ...state };
    }

    const state = await readDesktopAuthState(statePath);
    const connected = input.connected === false ? false : true;
    const nextState = {
      ...state,
      connected,
      baseUrl: credential.baseUrl,
      provider,
      lastValidatedAt: input.lastValidatedAt || new Date().toISOString(),
      capabilities: normalizeCapabilities(
        input.capabilities || state?.capabilities || {},
      ),
      message: String(input.message || state?.message || 'Validated.'),
    };
    await writeDesktopAuthState(statePath, nextState);
    return { ok: true, ...nextState };
  }

  async function disconnect() {
    await activeStore.clear();
    const state = disconnectedState(provider, 'Disconnected.');
    await writeDesktopAuthState(statePath, state);
    return { ok: true, ...state };
  }

  return {
    provider,
    storeName: provider,
    statePath,
    safeStoragePath,
    async getCredential() {
      return readCredential();
    },
    async status() {
      return readStatus();
    },
    async connect(input) {
      return saveCredential(input);
    },
    async validate(input) {
      return updateValidation(input);
    },
    async disconnect() {
      return disconnect();
    },
  };
}
