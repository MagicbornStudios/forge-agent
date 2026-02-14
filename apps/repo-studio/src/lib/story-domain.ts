import fs from 'node:fs/promises';
import path from 'node:path';

import { isPathWithinRoots, normalizeRelPath, resolveRepoRoot, resolveSafeAbsolutePath } from '@/lib/repo-files';

export type StoryPageNode = {
  id: string;
  name: string;
  index: number;
  path: string;
};

export type StoryChapterNode = {
  id: string;
  name: string;
  index: number;
  path: string;
  pages: StoryPageNode[];
};

export type StoryActNode = {
  id: string;
  name: string;
  index: number;
  path: string;
  chapters: StoryChapterNode[];
};

export type StoryTree = {
  roots: string[];
  acts: StoryActNode[];
  pageCount: number;
};

type ParsedFolder = {
  name: string;
  index: number;
};

function parseIndexedName(name: string, kind: 'act' | 'chapter'): ParsedFolder {
  const value = String(name || '').trim();
  const paren = new RegExp(`^${kind}\\s*\\((\\d+)\\)$`, 'i').exec(value);
  if (paren) return { name: value, index: Number(paren[1]) };
  const dash = new RegExp(`^${kind}[-_\\s]?(\\d+)$`, 'i').exec(value);
  if (dash) return { name: value, index: Number(dash[1]) };
  return { name: value, index: Number.MAX_SAFE_INTEGER };
}

function parsePageName(name: string) {
  const value = String(name || '').trim();
  const paren = /^page\s*\((\d+)\)\.md$/i.exec(value);
  if (paren) return { name: value, index: Number(paren[1]) };
  const dash = /^page[-_\s]?(\d+)\.md$/i.exec(value);
  if (dash) return { name: value, index: Number(dash[1]) };
  const numeric = /^(\d+)\.md$/i.exec(value);
  if (numeric) return { name: value, index: Number(numeric[1]) };
  if (/\.md$/i.test(value)) return { name: value, index: Number.MAX_SAFE_INTEGER };
  return null;
}

function compareByIndexAndName(a: { index: number; name: string }, b: { index: number; name: string }) {
  if (a.index !== b.index) return a.index - b.index;
  return a.name.localeCompare(b.name);
}

function canonicalActFolder(index: number) {
  return `act-${String(Math.max(1, index)).padStart(2, '0')}`;
}

function canonicalChapterFolder(index: number) {
  return `chapter-${String(Math.max(1, index)).padStart(2, '0')}`;
}

function canonicalPageFile(index: number) {
  return `page-${String(Math.max(1, index)).padStart(3, '0')}.md`;
}

async function readDirEntries(absolutePath: string) {
  try {
    return await fs.readdir(absolutePath, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function collectRootTree(root: string): Promise<StoryActNode[]> {
  const repoRoot = resolveRepoRoot();
  const rootAbsolute = resolveSafeAbsolutePath(repoRoot, root);
  const acts = await readDirEntries(rootAbsolute);
  const actNodes: StoryActNode[] = [];

  for (const actEntry of acts) {
    if (!actEntry.isDirectory()) continue;
    const actParsed = parseIndexedName(actEntry.name, 'act');
    const actRel = normalizeRelPath(path.join(root, actEntry.name));
    const chapterEntries = await readDirEntries(path.join(rootAbsolute, actEntry.name));
    const chapterNodes: StoryChapterNode[] = [];

    for (const chapterEntry of chapterEntries) {
      if (!chapterEntry.isDirectory()) continue;
      const chapterParsed = parseIndexedName(chapterEntry.name, 'chapter');
      const chapterRel = normalizeRelPath(path.join(actRel, chapterEntry.name));
      const pageEntries = await readDirEntries(path.join(rootAbsolute, actEntry.name, chapterEntry.name));
      const pageNodes: StoryPageNode[] = [];

      for (const pageEntry of pageEntries) {
        if (!pageEntry.isFile()) continue;
        const pageParsed = parsePageName(pageEntry.name);
        if (!pageParsed) continue;
        pageNodes.push({
          id: `story:page:${chapterRel}/${pageEntry.name}`,
          name: pageParsed.name,
          index: pageParsed.index,
          path: normalizeRelPath(path.join(chapterRel, pageEntry.name)),
        });
      }

      pageNodes.sort(compareByIndexAndName);
      chapterNodes.push({
        id: `story:chapter:${chapterRel}`,
        name: chapterParsed.name,
        index: chapterParsed.index,
        path: chapterRel,
        pages: pageNodes,
      });
    }

    chapterNodes.sort(compareByIndexAndName);
    actNodes.push({
      id: `story:act:${actRel}`,
      name: actParsed.name,
      index: actParsed.index,
      path: actRel,
      chapters: chapterNodes,
    });
  }

  actNodes.sort(compareByIndexAndName);
  return actNodes;
}

export async function listStoryTree(roots: string[]): Promise<StoryTree> {
  const normalizedRoots = [...new Set((roots || []).map((value) => normalizeRelPath(value)).filter(Boolean))];
  const acts: StoryActNode[] = [];
  for (const root of normalizedRoots) {
    // eslint-disable-next-line no-await-in-loop
    const rootActs = await collectRootTree(root);
    acts.push(...rootActs);
  }
  const pageCount = acts.reduce((count, act) => count + act.chapters.reduce((inner, chapter) => inner + chapter.pages.length, 0), 0);
  return {
    roots: normalizedRoots,
    acts,
    pageCount,
  };
}

export async function readStoryPage(repoRelativePath: string, roots: string[]) {
  const repoRoot = resolveRepoRoot();
  const normalized = normalizeRelPath(repoRelativePath);
  if (!isPathWithinRoots(normalized, roots)) {
    throw new Error(`Path is outside story roots: ${normalized}`);
  }
  const absolute = resolveSafeAbsolutePath(repoRoot, normalized);
  const content = await fs.readFile(absolute, 'utf8');
  return {
    path: normalized,
    content,
  };
}

export async function saveStoryPage(input: {
  path: string;
  content: string;
  roots: string[];
}) {
  const repoRoot = resolveRepoRoot();
  const normalized = normalizeRelPath(input.path);
  if (!isPathWithinRoots(normalized, input.roots)) {
    throw new Error(`Path is outside story roots: ${normalized}`);
  }
  const absolute = resolveSafeAbsolutePath(repoRoot, normalized);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, String(input.content || ''), 'utf8');
  return {
    path: normalized,
  };
}

export async function createStoryPage(input: {
  roots: string[];
  actIndex: number;
  chapterIndex: number;
  pageIndex: number;
  content?: string;
}) {
  const root = normalizeRelPath(input.roots[0] || 'content/story') || 'content/story';
  const pagePath = normalizeRelPath(path.join(
    root,
    canonicalActFolder(input.actIndex),
    canonicalChapterFolder(input.chapterIndex),
    canonicalPageFile(input.pageIndex),
  ));
  await saveStoryPage({
    path: pagePath,
    content: input.content || '',
    roots: input.roots,
  });
  return {
    path: pagePath,
  };
}

export async function readStoryReader(pathOrEmpty: string | undefined, roots: string[]) {
  const tree = await listStoryTree(roots);
  const pages = tree.acts.flatMap((act) => act.chapters.flatMap((chapter) => chapter.pages));
  const selected = normalizeRelPath(String(pathOrEmpty || ''));
  const current = pages.find((page) => page.path === selected) || pages[0] || null;
  const index = current ? pages.findIndex((page) => page.path === current.path) : -1;
  const prev = index > 0 ? pages[index - 1] : null;
  const next = index >= 0 && index < pages.length - 1 ? pages[index + 1] : null;

  if (!current) {
    return {
      tree,
      current: null,
      prev: null,
      next: null,
      content: '',
    };
  }

  const page = await readStoryPage(current.path, roots);
  return {
    tree,
    current,
    prev,
    next,
    content: page.content,
  };
}
