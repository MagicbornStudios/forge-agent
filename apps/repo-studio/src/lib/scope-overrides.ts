import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { normalizeRelPath, resolveRepoRoot } from '@/lib/repo-files';

export type ScopeOverrideEntry = {
  token: string;
  domain: string;
  roots: string[];
  reason: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
};

type ScopeOverrideStore = {
  version: 1;
  entries: ScopeOverrideEntry[];
};

const STORE_VERSION = 1 as const;
const DEFAULT_TTL_MINUTES = 30;

function nowIso() {
  return new Date().toISOString();
}

function storePath() {
  return path.join(resolveRepoRoot(), '.repo-studio', 'scope-overrides.json');
}

function normalizeRoots(roots: unknown) {
  if (!Array.isArray(roots)) return [];
  const values = roots
    .map((value) => normalizeRelPath(String(value || '')))
    .filter(Boolean);
  return [...new Set(values)];
}

function sanitizeEntry(entry: Partial<ScopeOverrideEntry>): ScopeOverrideEntry {
  const createdAt = String(entry.createdAt || nowIso());
  const expiresAt = String(entry.expiresAt || createdAt);
  return {
    token: String(entry.token || randomUUID()),
    domain: String(entry.domain || 'story').trim().toLowerCase() || 'story',
    roots: normalizeRoots(entry.roots),
    reason: String(entry.reason || '').trim(),
    createdAt,
    expiresAt,
    active: entry.active !== false,
  };
}

function isExpired(entry: ScopeOverrideEntry) {
  const expiry = Date.parse(entry.expiresAt);
  if (!Number.isFinite(expiry)) return true;
  return Date.now() >= expiry;
}

async function readStore(): Promise<ScopeOverrideStore> {
  try {
    const raw = await fs.readFile(storePath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<ScopeOverrideStore>;
    const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
    return {
      version: STORE_VERSION,
      entries: entries.map((entry) => sanitizeEntry(entry as Partial<ScopeOverrideEntry>)),
    };
  } catch {
    return { version: STORE_VERSION, entries: [] };
  }
}

async function writeStore(store: ScopeOverrideStore) {
  await fs.mkdir(path.dirname(storePath()), { recursive: true });
  await fs.writeFile(storePath(), `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

async function pruneExpired() {
  const store = await readStore();
  const next = store.entries.map((entry) => {
    if (entry.active && isExpired(entry)) return { ...entry, active: false };
    return entry;
  });
  const updated = { version: STORE_VERSION, entries: next };
  await writeStore(updated);
  return updated;
}

export async function getScopeOverrideStatus(input?: { token?: string; domain?: string }) {
  const store = await pruneExpired();
  const token = String(input?.token || '').trim();
  const domain = String(input?.domain || '').trim().toLowerCase();
  let entries = [...store.entries];
  if (token) entries = entries.filter((entry) => entry.token === token);
  if (domain) entries = entries.filter((entry) => entry.domain === domain);
  const active = entries.filter((entry) => entry.active);
  return {
    ok: true,
    entries,
    active,
    activeCount: active.length,
  };
}

export async function startScopeOverride(input: {
  domain?: string;
  roots?: string[];
  reason?: string;
  ttlMinutes?: number;
}) {
  const store = await pruneExpired();
  const ttl = Number(input.ttlMinutes || DEFAULT_TTL_MINUTES);
  const ttlMinutes = Number.isFinite(ttl) && ttl > 0 ? Math.min(ttl, 24 * 60) : DEFAULT_TTL_MINUTES;
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
  const entry = sanitizeEntry({
    token: randomUUID(),
    domain: String(input.domain || 'story').trim().toLowerCase() || 'story',
    roots: input.roots || [],
    reason: String(input.reason || '').trim(),
    createdAt,
    expiresAt,
    active: true,
  });

  store.entries.unshift(entry);
  await writeStore(store);
  return {
    ok: true,
    token: entry.token,
    entry,
    message: `Scope override started for domain "${entry.domain}" until ${entry.expiresAt}.`,
  };
}

export async function stopScopeOverride(input?: { token?: string; domain?: string }) {
  const store = await pruneExpired();
  const token = String(input?.token || '').trim();
  const domain = String(input?.domain || '').trim().toLowerCase();

  let changed = 0;
  const next = store.entries.map((entry) => {
    if (!entry.active) return entry;
    if (token && entry.token !== token) return entry;
    if (!token && domain && entry.domain !== domain) return entry;
    changed += 1;
    return { ...entry, active: false };
  });

  await writeStore({ version: STORE_VERSION, entries: next });
  return {
    ok: true,
    changed,
    message: changed > 0
      ? `Stopped ${changed} active scope override(s).`
      : 'No active scope overrides matched request.',
  };
}
