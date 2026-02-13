#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, 'apps/platform/content/docs');
const componentDemosRoot = path.join(repoRoot, 'apps/platform/src/components/docs');
const generatedDemoIdsPath = path.join(
  repoRoot,
  'apps/platform/src/components/docs/component-demos/generated-ids.ts',
);
const demoRegistryPath = path.join(
  repoRoot,
  'apps/platform/src/components/docs/component-demos/index.tsx',
);
const componentDemoComponentPath = path.join(
  repoRoot,
  'apps/platform/src/components/docs/ComponentDemo.tsx',
);
const showcaseVisibilityPath = path.join(
  repoRoot,
  'packages/shared/src/shared/components/docs/showcase/_showcase-visibility.json',
);

const aliasMap = new Map([
  ['editor-shell', 'components/editor-shell'],
  ['dock-layout', 'components/dock-layout'],
  ['dock-panel', 'components/dock-panel'],
  ['editor-toolbar', 'components/editor-toolbar'],
  ['editor-inspector', 'components/editor-inspector'],
  ['editor-overlay', 'components/editor-overlay'],
  ['panel-tabs', 'components/panel-tabs'],
  ['settings-system', 'components/settings-system'],
  ['components/editor-shell-complete', 'components/editor-shell'],
  ['components/dock-layout-complete', 'components/dock-layout'],
  ['components/dock-panel-complete', 'components/dock-panel'],
  ['components/editor-toolbar-complete', 'components/editor-toolbar'],
  ['components/editor-inspector-complete', 'components/editor-inspector'],
  ['components/editor-overlay-complete', 'components/editor-overlay'],
  ['components/editor-overlay-surface', 'components/editor-overlay'],
  ['components/editor-overlay-surface-complete', 'components/editor-overlay'],
  ['components/editor-status-bar', 'components/editor/editor-status-bar'],
  ['components/editor-review-bar', 'components/editor/editor-review-bar'],
  ['components/editor-button', 'components/editor/editor-button'],
  ['components/editor-menubar', 'components/editor/toolbar-editor-menubar'],
  ['components/panel-tabs-complete', 'components/panel-tabs'],
  ['components/settings-system-complete', 'components/settings-system'],
  ['components/00-index', 'components/index'],
  ['developer-guide/00-index', 'developer-guide/index'],
  ['ai-system/00-index', 'ai-system/overview'],
  ['roadmap', 'roadmap'],
]);

function readFilesRecursive(dir, exts) {
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (exts.some((ext) => full.endsWith(ext))) {
        out.push(full);
      }
    }
  }
  return out;
}

function existsDoc(targetPath) {
  const candidates = [];
  if (path.extname(targetPath)) {
    candidates.push(targetPath);
  } else {
    candidates.push(`${targetPath}.mdx`);
    candidates.push(`${targetPath}.md`);
    candidates.push(path.join(targetPath, 'index.mdx'));
    candidates.push(path.join(targetPath, 'index.md'));
    candidates.push(path.join(targetPath, 'meta.json'));
  }
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function normalizeRelKey(value) {
  return value
    .replace(/\\/g, '/')
    .replace(/\.(md|mdx)$/i, '')
    .replace(/\/index$/i, '')
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .replace(/\/$/, '');
}

function parseJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function checkMetaSchemaAndPages(failures) {
  const metaFiles = readFilesRecursive(docsRoot, ['meta.json']);

  for (const metaFile of metaFiles) {
    const relMeta = path.relative(repoRoot, metaFile).replace(/\\/g, '/');
    let json;
    try {
      json = parseJson(metaFile);
    } catch (error) {
      failures.push(`${relMeta}: invalid JSON (${error.message})`);
      continue;
    }

    if (!Array.isArray(json.pages)) {
      failures.push(`${relMeta}: pages must be an array`);
      continue;
    }

    json.pages.forEach((entry, index) => {
      if (typeof entry !== 'string') {
        failures.push(`${relMeta}: pages[${index}] must be a string`);
        return;
      }
      if (entry.startsWith('---')) return;

      const resolved = path.resolve(path.dirname(metaFile), entry);
      if (!existsDoc(resolved)) {
        failures.push(`${relMeta}: missing page target "${entry}"`);
      }
    });
  }
}

function extractLinks(content) {
  const links = [];
  const markdownLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  const htmlHrefPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/g;

  let match;
  while ((match = markdownLinkPattern.exec(content))) links.push(match[1]);
  while ((match = htmlHrefPattern.exec(content))) links.push(match[1]);

  return links;
}

function linkIsIgnored(href) {
  return (
    !href ||
    href.startsWith('#') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('/')
  );
}

function checkRelativeLinks(failures) {
  const docFiles = readFilesRecursive(docsRoot, ['.md', '.mdx']);

  for (const docFile of docFiles) {
    const relDoc = path.relative(repoRoot, docFile).replace(/\\/g, '/');
    const content = fs.readFileSync(docFile, 'utf8');
    const links = extractLinks(content);

    for (const rawHref of links) {
      const href = rawHref.trim();
      if (linkIsIgnored(href)) continue;

      const [pathPart] = href.split('#', 2);
      const [cleanPath] = pathPart.split('?', 2);
      if (!cleanPath) continue;

      const resolved = path.resolve(path.dirname(docFile), cleanPath);
      if (resolved.startsWith(docsRoot) && existsDoc(resolved)) continue;

      const aliasKey = normalizeRelKey(path.relative(docsRoot, resolved));
      if (aliasMap.has(aliasKey)) continue;

      failures.push(`${relDoc}: broken relative link "${href}"`);
    }
  }
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\\/_.\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function normalizeEditorSlug(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized === 'EditorDockLayout.tsx') return 'dock-layout';
  if (normalized === 'EditorDockPanel.tsx') return 'dock-panel';
  return toKebabCase(normalized.replace(/\.tsx$/, '').replace(/\//g, '-'));
}

function expectedCoverage() {
  const atoms = fs
    .readdirSync(path.join(repoRoot, 'packages/ui/src/components/ui'))
    .filter((name) => name.endsWith('.tsx'))
    .map((name) => toKebabCase(name.replace(/\.tsx$/, '')))
    .sort((a, b) => a.localeCompare(b));

  const editor = readFilesRecursive(path.join(repoRoot, 'packages/shared/src/shared/components/editor'), ['.tsx'])
    .filter((filePath) => !filePath.endsWith('index.tsx'))
    .map((filePath) => {
      const rel = path.relative(path.join(repoRoot, 'packages/shared/src/shared/components/editor'), filePath).replace(/\\/g, '/');
      return normalizeEditorSlug(rel);
    })
    .sort((a, b) => a.localeCompare(b));

  const assistant = readFilesRecursive(path.join(repoRoot, 'packages/shared/src/shared/components/assistant-ui'), ['.tsx'])
    .filter((filePath) => !filePath.endsWith('index.tsx'))
    .map((filePath) => {
      const rel = path.relative(path.join(repoRoot, 'packages/shared/src/shared/components/assistant-ui'), filePath).replace(/\\/g, '/');
      return toKebabCase(rel.replace(/\.tsx$/, '').replace(/\//g, '-'));
    })
    .sort((a, b) => a.localeCompare(b));

  const toolUi = fs
    .readdirSync(path.join(repoRoot, 'packages/shared/src/shared/components/tool-ui'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => toKebabCase(entry.name))
    .sort((a, b) => a.localeCompare(b));

  return { atoms, editor, assistant, toolUi };
}

function readMetaPages(metaPath) {
  const json = parseJson(metaPath);
  return Array.isArray(json.pages) ? json.pages.filter((entry) => typeof entry === 'string') : [];
}

function checkCoverage(failures) {
  const expected = expectedCoverage();

  const checks = [
    {
      id: 'atoms',
      expected: expected.atoms,
      baseDir: path.join(docsRoot, 'components/atoms'),
      meta: path.join(docsRoot, 'components/atoms/meta.json'),
    },
    {
      id: 'editor',
      expected: expected.editor,
      baseDir: path.join(docsRoot, 'components/editor'),
      meta: path.join(docsRoot, 'components/editor/meta.json'),
    },
    {
      id: 'assistant-ui',
      expected: expected.assistant,
      baseDir: path.join(docsRoot, 'components/assistant-ui'),
      meta: path.join(docsRoot, 'components/assistant-ui/meta.json'),
    },
    {
      id: 'tool-ui',
      expected: expected.toolUi,
      baseDir: path.join(docsRoot, 'components/tool-ui'),
      meta: path.join(docsRoot, 'components/tool-ui/meta.json'),
    },
  ];

  for (const check of checks) {
    for (const slug of check.expected) {
      const docPath = path.join(check.baseDir, `${slug}.mdx`);
      if (!fs.existsSync(docPath)) {
        failures.push(`coverage(${check.id}): missing generated page ${path.relative(repoRoot, docPath).replace(/\\/g, '/')}`);
      }
    }

    if (!fs.existsSync(check.meta)) {
      failures.push(`coverage(${check.id}): missing meta file ${path.relative(repoRoot, check.meta).replace(/\\/g, '/')}`);
      continue;
    }

    const pages = new Set(readMetaPages(check.meta));
    for (const slug of check.expected) {
      if (!pages.has(slug)) {
        failures.push(`coverage(${check.id}): meta missing slug "${slug}"`);
      }
    }
  }
}

function extractComponentDemoIdsFromDocs() {
  const docFiles = readFilesRecursive(path.join(docsRoot, 'components'), ['.md', '.mdx']);
  const ids = new Set();

  for (const filePath of docFiles) {
    const relative = path.relative(path.join(docsRoot, 'components'), filePath).replace(/\\/g, '/');
    if (relative.startsWith('showcase/')) {
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.matchAll(/<ComponentDemo\s+id=["']([^"']+)["']\s*\/>/g);
    for (const match of matches) {
      const id = match[1]?.trim();
      if (id) ids.add(id);
    }
  }

  return [...ids].sort((a, b) => a.localeCompare(b));
}

function readGeneratedDemoIds() {
  if (!fs.existsSync(generatedDemoIdsPath)) return null;
  const content = fs.readFileSync(generatedDemoIdsPath, 'utf8');
  const ids = [...content.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  return [...new Set(ids)].sort((a, b) => a.localeCompare(b));
}

function readShowcaseEntryIds() {
  const catalogPath = path.join(
    repoRoot,
    'packages/shared/src/shared/components/docs/showcase/catalog-data.mjs',
  );
  if (!fs.existsSync(catalogPath)) return [];
  const content = fs.readFileSync(catalogPath, 'utf8');
  const ids = [...content.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1]);
  return [...new Set(ids)].filter((id) => id !== 'atoms' && id !== 'molecules' && id !== 'organisms');
}

function getDocPathForGeneratedId(id) {
  const [prefix, slug] = id.split('.');
  if (!slug) return null;
  const categoryMap = {
    ui: 'atoms',
    editor: 'editor',
    'assistant-ui': 'assistant-ui',
    'tool-ui': 'tool-ui',
  };
  const category = categoryMap[prefix];
  if (!category) return null;
  return path.join(docsRoot, 'components', category, `${slug}.mdx`);
}

function checkDemoCoverage(failures) {
  const docsIds = extractComponentDemoIdsFromDocs();
  const generatedIds = readGeneratedDemoIds();
  const showcaseIds = readShowcaseEntryIds();
  const allValidIds = new Set([...(generatedIds ?? []), ...showcaseIds]);

  if (generatedIds == null) {
    failures.push(
      `demo-coverage: missing generated ids file ${path.relative(repoRoot, generatedDemoIdsPath).replace(/\\/g, '/')}`,
    );
    return;
  }

  for (const id of docsIds) {
    if (!allValidIds.has(id)) {
      failures.push(`demo-coverage: component docs has "${id}" but it is not in generated ids or showcase catalog`);
    }
  }

  for (const generatedId of generatedIds) {
    if (docsIds.includes(generatedId)) continue;
    const docPath = getDocPathForGeneratedId(generatedId);
    if (!docPath || !fs.existsSync(docPath)) continue;
    const docContent = fs.readFileSync(docPath, 'utf8');
    const docDemoIds = [...docContent.matchAll(/<ComponentDemo\s+id=["']([^"']+)["']\s*\/>/g)].map(
      (m) => m[1],
    );
    const usesShowcaseId = docDemoIds.some((docId) => showcaseIds.includes(docId));
    if (usesShowcaseId) continue;
    failures.push(`demo-coverage: generated ids has "${generatedId}" but component docs does not`);
  }

  if (!fs.existsSync(demoRegistryPath)) {
    failures.push(
      `demo-coverage: missing demo registry ${path.relative(repoRoot, demoRegistryPath).replace(/\\/g, '/')}`,
    );
    return;
  }

  const registryContent = fs.readFileSync(demoRegistryPath, 'utf8');
  if (!registryContent.includes('COMPONENT_DEMO_IDS')) {
    failures.push('demo-coverage: registry must build map from COMPONENT_DEMO_IDS');
  }

  if (!fs.existsSync(componentDemoComponentPath)) {
    failures.push(
      `demo-coverage: missing ComponentDemo component ${path.relative(repoRoot, componentDemoComponentPath).replace(/\\/g, '/')}`,
    );
    return;
  }

  const componentDemoContent = fs.readFileSync(componentDemoComponentPath, 'utf8');
  if (componentDemoContent.includes('PrefixFallback') || componentDemoContent.includes('renderFallback(')) {
    failures.push('demo-coverage: ComponentDemo must not use placeholder fallback rendering');
  }
}

function checkShowcaseVisibility(failures) {
  const showcaseDir = path.join(docsRoot, 'components/showcase');
  if (!fs.existsSync(showcaseDir)) {
    failures.push(`showcase: missing directory ${path.relative(repoRoot, showcaseDir).replace(/\\/g, '/')}`);
    return;
  }

  if (!fs.existsSync(showcaseVisibilityPath)) {
    failures.push(
      `showcase: missing visibility config ${path.relative(repoRoot, showcaseVisibilityPath).replace(/\\/g, '/')}`,
    );
    return;
  }

  const visibilityJson = parseJson(showcaseVisibilityPath);
  const internalOnly = new Set(Array.isArray(visibilityJson.internalOnly) ? visibilityJson.internalOnly : []);
  const showcaseFiles = readFilesRecursive(showcaseDir, ['.mdx']);

  for (const filePath of showcaseFiles) {
    const relPath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const ids = [...content.matchAll(/<ComponentDemo\s+id=["']([^"']+)["']\s*\/>/g)].map((match) => match[1]);

    if (ids.length === 0 && !content.includes('Platform entries: **0**')) {
      failures.push(`showcase: ${relPath} has no ComponentDemo entries and is not marked empty`);
    }

    for (const id of ids) {
      if (internalOnly.has(id)) {
        failures.push(`showcase: ${relPath} contains internal-only demo id "${id}"`);
      }
    }
  }
}

function main() {
  const failures = [];

  checkMetaSchemaAndPages(failures);
  checkRelativeLinks(failures);
  checkCoverage(failures);
  checkDemoCoverage(failures);
  checkShowcaseVisibility(failures);

  if (failures.length > 0) {
    process.stderr.write('[platform-docs-doctor] FAIL\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write('[platform-docs-doctor] PASS\n');
}

main();
