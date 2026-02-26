import path from 'node:path';

import { RepoStudioRoot } from '@/components/RepoStudioRoot';
import { loadRepoStudioSnapshot } from '@/lib/repo-data';

export default async function Page() {
  const repoRoot = path.resolve(process.cwd(), '..', '..');
  const snapshot = await loadRepoStudioSnapshot(repoRoot);
  return (
    <RepoStudioRoot
      commands={snapshot.commands}
      planning={snapshot.planning}
      loops={snapshot.loops}
    />
  );
}

