/**
 * Forge Yarn export API client
 */
import { API_ROUTES } from './routes';

export async function exportYarnFull(graphId: number): Promise<{ yarn: string }> {
  const res = await fetch(API_ROUTES.FORGE_YARN_EXPORT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ graphId }),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Export failed: ${res.status}`);
  }
  return res.json();
}
