import path from 'node:path';

import { RepoStudioShell } from '@/components/RepoStudioShell';
import { loadRepoStudioSnapshot } from '@/lib/repo-data';

export default async function Page() {
  const repoRoot = path.resolve(process.cwd(), '..', '..');
  const snapshot = await loadRepoStudioSnapshot(repoRoot);
  return (
    <RepoStudioShell
      commands={snapshot.commands}
      planning={snapshot.planning}
    />
  );
}
