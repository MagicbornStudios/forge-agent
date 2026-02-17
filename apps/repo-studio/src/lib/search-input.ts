export type RepoSearchScope = 'workspace' | 'loop';

const MAX_QUERY_LENGTH = 500;
const MAX_GLOB_LENGTH = 120;
const MAX_GLOB_COUNT = 20;

function parseBooleanFlag(value: string | null) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function normalizeScope(value: string | null): RepoSearchScope {
  return String(value || '').trim().toLowerCase() === 'loop'
    ? 'loop'
    : 'workspace';
}

function parseCsvList(value: string | null) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isSafeGlobPattern(value: string) {
  if (!value) return false;
  if (value.length > MAX_GLOB_LENGTH) return false;
  if (value.includes('\0')) return false;
  if (value.includes('..')) return false;
  if (value.startsWith('/') || /^[a-z]:\//i.test(value)) return false;
  return /^[a-zA-Z0-9._@\-/*?[\]{}!+,]+$/.test(value);
}

function parseAndValidateGlobs(value: string | null, key: string) {
  const values = parseCsvList(value);
  if (values.length > MAX_GLOB_COUNT) {
    throw new Error(`${key} supports at most ${MAX_GLOB_COUNT} patterns.`);
  }
  const invalid = values.find((pattern) => !isSafeGlobPattern(pattern));
  if (invalid) {
    throw new Error(`Invalid ${key} pattern: ${invalid}`);
  }
  return values;
}

export type RepoSearchInput = {
  query: string;
  regex: boolean;
  scope: RepoSearchScope;
  loopId: string | null;
  include: string[];
  exclude: string[];
};

export function parseRepoSearchInput(url: URL): RepoSearchInput {
  const query = String(url.searchParams.get('q') || '').trim();
  if (!query) {
    throw new Error('q is required.');
  }
  if (query.length > MAX_QUERY_LENGTH) {
    throw new Error(`q exceeds ${MAX_QUERY_LENGTH} characters.`);
  }
  const regex = parseBooleanFlag(url.searchParams.get('regex'));
  if (regex) {
    try {
      // Validate regex without executing it.
      // eslint-disable-next-line no-new
      new RegExp(query);
    } catch (error: any) {
      throw new Error(`Invalid regex: ${String(error?.message || error)}`);
    }
  }

  const scope = normalizeScope(url.searchParams.get('scope'));
  const loopIdRaw = String(url.searchParams.get('loopId') || '').trim().toLowerCase();
  const loopId = loopIdRaw || null;
  const include = parseAndValidateGlobs(url.searchParams.get('include'), 'include');
  const exclude = parseAndValidateGlobs(url.searchParams.get('exclude'), 'exclude');

  return {
    query,
    regex,
    scope,
    loopId,
    include,
    exclude,
  };
}
