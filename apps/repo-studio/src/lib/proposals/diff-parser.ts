import { sanitizeList } from './contracts';

export type ParsedProposalDiffFile = {
  path: string;
  status: 'added' | 'deleted' | 'modified' | 'unknown';
  additions: number;
  deletions: number;
  hunkCount: number;
  hasPatch: boolean;
  unifiedPatch: string;
};

export type ParsedProposalDiff = {
  files: ParsedProposalDiffFile[];
  warnings: string[];
};

function normalizeDiffPath(value: string) {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  if (normalized === '/dev/null') return normalized;
  if (normalized.startsWith('a/') || normalized.startsWith('b/')) {
    return normalized.slice(2);
  }
  return normalized;
}

function parseDiffHeader(line: string) {
  const match = /^diff --git a\/(.+?) b\/(.+)$/.exec(line.trim());
  if (!match) return null;
  return {
    oldPath: normalizeDiffPath(match[1]),
    newPath: normalizeDiffPath(match[2]),
  };
}

function finalizeEntry(
  entries: ParsedProposalDiffFile[],
  current: ParsedProposalDiffFile | null,
  oldPath: string,
  newPath: string,
) {
  if (!current) return;
  const effectivePath = current.path || (newPath !== '/dev/null' ? newPath : oldPath);
  const status = oldPath === '/dev/null'
    ? 'added'
    : newPath === '/dev/null'
      ? 'deleted'
      : (current.status === 'unknown' ? 'modified' : current.status);
  entries.push({
    ...current,
    path: effectivePath,
    status,
  });
}

export function parseProposalUnifiedDiff(input: {
  diff: string;
  fallbackFiles?: string[];
}) {
  const warnings: string[] = [];
  const sourceDiff = String(input.diff || '');
  const lines = sourceDiff.split(/\r?\n/);
  const entries: ParsedProposalDiffFile[] = [];
  const fallbackFiles = sanitizeList(input.fallbackFiles || []);

  let current: ParsedProposalDiffFile | null = null;
  let currentOldPath = '';
  let currentNewPath = '';
  let currentPatchLines: string[] = [];

  const snapshotCurrent = () => {
    if (!current) return null;
    const active = current as ParsedProposalDiffFile;
    return {
      ...active,
      unifiedPatch: currentPatchLines.join('\n').trimEnd(),
    };
  };

  const beginEntry = (headerPath?: { oldPath: string; newPath: string } | null) => {
    finalizeEntry(entries, snapshotCurrent(), currentOldPath, currentNewPath);
    currentPatchLines = [];
    currentOldPath = headerPath?.oldPath || '';
    currentNewPath = headerPath?.newPath || '';
    current = {
      path: headerPath?.newPath || headerPath?.oldPath || '',
      status: 'unknown',
      additions: 0,
      deletions: 0,
      hunkCount: 0,
      hasPatch: false,
      unifiedPatch: '',
    };
  };

  for (const line of lines) {
    const header = parseDiffHeader(line);
    if (header) {
      beginEntry(header);
      currentPatchLines.push(line);
      continue;
    }

    if (!current) {
      if (line.trim().length > 0) {
        warnings.push('Diff payload did not include file headers; using fallback file metadata.');
      }
      continue;
    }
    const active: ParsedProposalDiffFile = current as ParsedProposalDiffFile;

    currentPatchLines.push(line);
    if (line.startsWith('--- ')) {
      currentOldPath = normalizeDiffPath(line.slice(4));
      continue;
    }
    if (line.startsWith('+++ ')) {
      currentNewPath = normalizeDiffPath(line.slice(4));
      active.path = currentNewPath !== '/dev/null' ? currentNewPath : currentOldPath;
      continue;
    }
    if (line.startsWith('@@')) {
      active.hunkCount += 1;
      active.hasPatch = true;
      continue;
    }
    if (line.startsWith('+') && !line.startsWith('+++')) {
      active.additions += 1;
      active.hasPatch = true;
      continue;
    }
    if (line.startsWith('-') && !line.startsWith('---')) {
      active.deletions += 1;
      active.hasPatch = true;
    }
  }

  finalizeEntry(entries, snapshotCurrent(), currentOldPath, currentNewPath);

  if (entries.length === 0) {
    if (fallbackFiles.length === 0) {
      if (sourceDiff.trim()) {
        warnings.push('No file paths found in diff payload; exposing synthetic patch record.');
        return {
          files: [
            {
              path: '(proposal.diff)',
              status: 'unknown' as const,
              additions: 0,
              deletions: 0,
              hunkCount: 0,
              hasPatch: sourceDiff.trim().length > 0,
              unifiedPatch: sourceDiff.trim(),
            },
          ],
          warnings,
        };
      }
      return { files: [], warnings };
    }

    return {
      files: fallbackFiles.map((filePath) => ({
        path: filePath,
        status: 'unknown' as const,
        additions: 0,
        deletions: 0,
        hunkCount: 0,
        hasPatch: sourceDiff.trim().length > 0,
        unifiedPatch: sourceDiff.trim(),
      })),
      warnings,
    };
  }

  return {
    files: entries.map((entry) => ({
      ...entry,
      unifiedPatch: String(entry.unifiedPatch || '').trimEnd(),
    })),
    warnings,
  } satisfies ParsedProposalDiff;
}
