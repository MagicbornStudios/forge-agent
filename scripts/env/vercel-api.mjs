/**
 * Thin wrapper for Vercel REST API - env endpoints only.
 * Used by vercel-sync.mjs and env portal.
 */

const VERCEL_API_BASE = 'https://api.vercel.com';

/**
 * @param {string} token
 * @param {string} [teamId]
 */
function createHeaders(token, teamId) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (teamId) {
    headers['x-vercel-team-id'] = teamId;
  }
  return headers;
}

/**
 * @param {string} projectIdOrName
 * @param {string} token
 * @param {string} [teamId]
 */
export async function getProjectEnv(projectIdOrName, token, teamId) {
  const url = new URL(`/v10/projects/${encodeURIComponent(projectIdOrName)}/env`, VERCEL_API_BASE);
  if (teamId) url.searchParams.set('teamId', teamId);
  const res = await fetch(url.toString(), {
    headers: createHeaders(token, teamId),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel API ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * @param {string} projectIdOrName
 * @param {{ key: string, value: string, type: 'plain'|'encrypted', target: ('production'|'preview'|'development')[] }} envVar
 * @param {string} token
 * @param {string} [teamId]
 */
export async function upsertProjectEnv(projectIdOrName, envVar, token, teamId) {
  const url = new URL(`/v10/projects/${encodeURIComponent(projectIdOrName)}/env`, VERCEL_API_BASE);
  url.searchParams.set('upsert', 'true');
  if (teamId) url.searchParams.set('teamId', teamId);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: createHeaders(token, teamId),
    body: JSON.stringify(envVar),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel API ${res.status}: ${body}`);
  }
  return res.json();
}
