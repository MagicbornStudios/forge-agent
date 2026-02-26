import type { PlanningDocEntry } from '@/lib/repo-data';

export interface PlanningDocTreeNode {
  name: string;
  docId?: string;
}

function lastSegment(path: string): string {
  const normalized = path.replace(/\/+$/, '').trim();
  if (!normalized) return path;
  const idx = normalized.lastIndexOf('/');
  return idx < 0 ? normalized : normalized.slice(idx + 1);
}

/**
 * Build a virtual filesystem from planning doc file paths for use with headless-tree.
 * Folder id = path prefix (e.g. ".planning", ".planning/phases"); file id = doc.id.
 */
export function buildPlanningDocTreeData(docs: PlanningDocEntry[]) {
  const normalizedDocs = docs.map((d) => ({
    ...d,
    filePath: d.filePath.replace(/\/+$/, '').trim(),
  }));

  const folderIds = new Set<string>();
  for (const doc of normalizedDocs) {
    const path = doc.filePath;
    if (!path) continue;
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) {
      folderIds.add(parts.slice(0, i).join('/'));
    }
  }

  const childrenByFolder = new Map<string, { folderIds: string[]; docIds: string[] }>();

  for (const doc of normalizedDocs) {
    const path = doc.filePath;
    if (!path) continue;
    const parts = path.split('/');
    const dir = parts.length === 1 ? '' : parts.slice(0, -1).join('/');
    if (!childrenByFolder.has(dir)) {
      childrenByFolder.set(dir, { folderIds: [], docIds: [] });
    }
    const entry = childrenByFolder.get(dir)!;
    if (!entry.docIds.includes(doc.id)) {
      entry.docIds.push(doc.id);
    }
  }

  for (const folderId of folderIds) {
    const parts = folderId.split('/');
    const parent = parts.length === 1 ? '' : parts.slice(0, -1).join('/');
    if (!childrenByFolder.has(parent)) {
      childrenByFolder.set(parent, { folderIds: [], docIds: [] });
    }
    const entry = childrenByFolder.get(parent)!;
    const childFolderId = folderId;
    if (!entry.folderIds.includes(childFolderId)) {
      entry.folderIds.push(childFolderId);
    }
  }

  for (const entry of childrenByFolder.values()) {
    entry.folderIds.sort();
    entry.docIds.sort();
  }

  const docById = new Map(normalizedDocs.map((d) => [d.id, d]));

  const rootChildren = childrenByFolder.get('');
  const rootItemId =
    rootChildren?.folderIds.length === 1
      ? rootChildren.folderIds[0]!
      : folderIds.size > 0
        ? (() => {
            const first = normalizedDocs.find((d) => d.filePath);
            if (!first) return '.planning';
            const segments = first.filePath.split('/');
            return segments[0] ?? '.planning';
          })()
        : '';

  function getItem(id: string): PlanningDocTreeNode {
    if (docById.has(id)) {
      const doc = docById.get(id)!;
      return { name: lastSegment(doc.filePath), docId: doc.id };
    }
    if (id === '' || folderIds.has(id) || childrenByFolder.has(id)) {
      return { name: id ? lastSegment(id) : '(root)' };
    }
    return { name: id };
  }

  function getChildren(id: string): string[] {
    const entry = childrenByFolder.get(id);
    if (!entry) return [];
    return [...entry.folderIds, ...entry.docIds];
  }

  return {
    rootItemId: rootItemId || '',
    getItem,
    getChildren,
  };
}
