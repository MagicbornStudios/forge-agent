import { loadRepoStudioSnapshot } from '@/lib/repo-data';
import { resolveRepoRoot } from '@/lib/repo-files';
import { withRepoRoute } from '@/lib/api/with-repo-route';

export const GET = withRepoRoute(async () => {
  const repoRoot = resolveRepoRoot();
  const snapshot = await loadRepoStudioSnapshot(repoRoot);
  return { ok: true, loops: snapshot.loops };
});

