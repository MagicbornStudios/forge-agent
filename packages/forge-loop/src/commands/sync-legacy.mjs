import path from 'node:path';

import { PLANNING_FILES } from '../lib/paths.mjs';
import { fileExists } from '../lib/fs-utils.mjs';
import {
  getAutoCommitEnabled,
  getCommitScope,
  getLegacySyncTargets,
  isLegacySyncEnabled,
  loadPlanningConfig,
} from '../lib/config.mjs';
import { assertCommitResult, commitPaths, formatArtifactCommitMessage } from '../lib/git.mjs';
import { syncLegacyFromPlanning } from '../lib/legacy-sync.mjs';

export async function runSyncLegacy(options = {}) {
  if (!fileExists(PLANNING_FILES.project)) {
    throw new Error('PROJECT.md not found under .planning. Run forge-loop new-project first.');
  }

  const config = loadPlanningConfig();
  if (!isLegacySyncEnabled(config) && !options.force) {
    return {
      touched: [],
      skipped: true,
      reason: 'legacy-sync-disabled',
      message: 'Legacy sync is disabled by .planning/config.json (legacySync.enabled=false).',
    };
  }

  const touched = syncLegacyFromPlanning({ targets: getLegacySyncTargets(config) });

  const autoCommit = options.autoCommit ?? getAutoCommitEnabled(config);
  if (autoCommit) {
    const commitFiles = touched.map((filePath) => path.relative(process.cwd(), filePath).replace(/\\/g, '/'));
    const commitResult = commitPaths(process.cwd(), formatArtifactCommitMessage('sync legacy snapshots'), commitFiles, {
      commitScope: getCommitScope(config),
      allowOutOfScope: options.allowOutOfScope === true,
    });
    assertCommitResult(commitResult, 'sync-legacy');
  }

  return { touched };
}
