import fs from 'node:fs/promises';
import path from 'node:path';

function defaultState() {
  return {
    connected: false,
    baseUrl: '',
    provider: 'memory',
    lastValidatedAt: null,
    capabilities: {
      connect: false,
      read: false,
      write: false,
    },
    message: '',
  };
}

export async function readDesktopAuthState(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
    };
  } catch {
    return defaultState();
  }
}

export async function writeDesktopAuthState(filePath, state) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const merged = {
    ...defaultState(),
    ...(state && typeof state === 'object' ? state : {}),
  };
  await fs.writeFile(filePath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  return merged;
}
