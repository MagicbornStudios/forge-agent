import type { EnvScopeEntry, EnvFileEntry } from '@/lib/api/types';

export const ENV_SCOPES_ROOT_ITEM_ID = '.env-scopes';

export interface EnvScopeTreeNode {
  name: string;
  /** Set for file (leaf) nodes: repo-relative path. Used as panel id and for onOpenFile(path). */
  docId?: string;
}

function basename(filePath: string): string {
  const normalized = filePath.replace(/\/+$/, '').trim();
  if (!normalized) return filePath;
  const idx = normalized.lastIndexOf('/');
  return idx < 0 ? normalized : normalized.slice(idx + 1);
}

/**
 * Build tree data for env scopes (root + apps) and their .env* files.
 * Root id = ENV_SCOPES_ROOT_ITEM_ID; children = scope ids; getChildren(scopeId) = file paths.
 */
export function buildEnvScopeTreeData(
  scopes: EnvScopeEntry[],
  filesByDir: Record<string, EnvFileEntry[]>,
) {
  const scopeById = new Map(scopes.map((s) => [s.id, s]));

  function getItem(id: string): EnvScopeTreeNode {
    if (id === ENV_SCOPES_ROOT_ITEM_ID) {
      return { name: 'Env' };
    }
    const scope = scopeById.get(id);
    if (scope) {
      return { name: scope.label };
    }
    // id is a file path (repo-relative)
    return { name: basename(id), docId: id };
  }

  function getChildren(id: string): string[] {
    if (id === ENV_SCOPES_ROOT_ITEM_ID) {
      return scopes.map((s) => s.id);
    }
    const scope = scopeById.get(id);
    if (scope) {
      const files = filesByDir[scope.dir] ?? [];
      return files.map((f) => f.path);
    }
    return [];
  }

  return {
    rootItemId: ENV_SCOPES_ROOT_ITEM_ID,
    getItem,
    getChildren,
  };
}
