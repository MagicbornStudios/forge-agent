import type { Folder, Item, Node } from 'fumadocs-core/page-tree';
import { toPlainText, toTitleFromHref } from './tree-label';

export function isItem(node: Node): node is Item {
  return node.type === 'page';
}

export function isFolder(node: Node): node is Folder {
  return node.type === 'folder';
}

export function resolveFolderUrl(folder: Folder): string | null {
  if (folder.index?.url) return folder.index.url;
  for (const child of folder.children) {
    if (isItem(child)) return child.url;
    if (isFolder(child)) {
      const nested = resolveFolderUrl(child);
      if (nested) return nested;
    }
  }
  return null;
}

export function resolveNodeLabel(node: Item | Folder): string {
  if (isItem(node)) {
    return toPlainText(node.name, toTitleFromHref(node.url, 'Doc'));
  }

  const fallbackUrl = resolveFolderUrl(node) ?? '';
  const fallbackLabel = toTitleFromHref(fallbackUrl, 'Docs');
  return toPlainText(node.name, toPlainText(node.index?.name, fallbackLabel));
}

