import { RepoStudioRoot } from '@/components/RepoStudioRoot';
import { resolveActiveProjectRoot } from '@/lib/project-root';
import { loadRepoStudioSnapshot } from '@/lib/repo-data';

export default async function Page() {
  const repoRoot = resolveActiveProjectRoot();
  const snapshot = await loadRepoStudioSnapshot(repoRoot);
  return (
    <RepoStudioRoot
      commands={snapshot.commands}
      planning={snapshot.planning}
      loops={snapshot.loops}
    />
  );
}
