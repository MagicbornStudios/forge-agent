#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const docsComponentsDir = path.join(repoRoot, 'apps/platform/content/docs/components');
const atomsSourceDir = path.join(repoRoot, 'packages/ui/src/components/ui');
const editorSourceDir = path.join(repoRoot, 'packages/shared/src/shared/components/editor');
const assistantSourceDir = path.join(repoRoot, 'packages/shared/src/shared/components/assistant-ui');
const toolUiSourceDir = path.join(repoRoot, 'packages/shared/src/shared/components/tool-ui');
const componentDemoIdsOutputPath = path.join(
  repoRoot,
  'apps/platform/src/components/docs/component-demos/generated-ids.ts',
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readDirFilesRecursive(dir, extensions) {
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (extensions.some((ext) => full.endsWith(ext))) {
        out.push(full);
      }
    }
  }
  return out;
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

function toTitle(value) {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[\\/_-]+/g, ' ')
    .trim();

  if (!normalized) return 'Component';

  return normalized
    .split(/\s+/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeEditorSlug(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized === 'EditorDockLayout.tsx') return 'dock-layout';
  if (normalized === 'EditorDockPanel.tsx') return 'dock-panel';
  return toKebabCase(normalized.replace(/\.tsx$/, '').replace(/\//g, '-'));
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${content.trim()}\n`, 'utf8');
}

function writeJson(filePath, value) {
  writeText(filePath, JSON.stringify(value, null, 2));
}

function docTemplate({ title, description, icon, demoId, importSnippet, sourcePath }) {
  return `---
title: ${title}
description: ${description}
icon: ${icon}
---

import { ComponentDemo } from '@/components/docs/ComponentDemo';

# ${title}

<ComponentDemo id="${demoId}" />

## Import

\`\`\`tsx
${importSnippet}
\`\`\`

## Source

\`${sourcePath}\`
`;
}

function indexTemplate({ title, description, links }) {
  const list = links.map((entry) => `- [${entry.title}](./${entry.slug})`).join('\n');
  return `---
title: ${title}
description: ${description}
icon: Component
---

# ${title}

${description}

## Catalog

${list || '- No entries'}
`;
}

function normalizeLegacyLinks(content) {
  const replacements = [
    [/\.\/editor-shell-complete(?:\.mdx)?/g, './editor-shell'],
    [/\.\/dock-layout-complete(?:\.mdx)?/g, './dock-layout'],
    [/\.\/dock-panel-complete(?:\.mdx)?/g, './dock-panel'],
    [/\.\/editor-toolbar-complete(?:\.mdx)?/g, './editor-toolbar'],
    [/\.\/editor-inspector-complete(?:\.mdx)?/g, './editor-inspector'],
    [/\.\/editor-overlay-surface-complete(?:\.mdx)?/g, './editor-overlay'],
    [/\.\/editor-overlay-complete(?:\.mdx)?/g, './editor-overlay'],
    [/\.\/panel-tabs-complete(?:\.mdx)?/g, './panel-tabs'],
    [/\.\/settings-system-complete(?:\.mdx)?/g, './settings-system'],
    [/\.\.\/components\/editor-shell-complete(?:\.mdx)?/g, '../components/editor-shell'],
    [/\.\.\/components\/dock-layout-complete(?:\.mdx)?/g, '../components/dock-layout'],
    [/\.\.\/components\/dock-panel-complete(?:\.mdx)?/g, '../components/dock-panel'],
    [/\.\.\/components\/editor-inspector-complete(?:\.mdx)?/g, '../components/editor-inspector'],
    [/\.\.\/components\/settings-system-complete(?:\.mdx)?/g, '../components/settings-system'],
    [/\.\/settings-integration(?:\.mdx)?/g, './settings-integration'],
    [/\.\.\/components\/00-index(?:\.mdx)?/g, '../components/index'],
    [/\.\/00-index(?:\.mdx)?/g, './index'],
    [/\.\.\/developer-guide\/00-index(?:\.mdx)?/g, '../developer-guide/index'],
    [/\.\.\/ai-system\/00-index(?:\.mdx)?/g, '../ai-system/overview'],
    [/\.\/roadmap\.mdx/g, './roadmap'],
  ];

  let next = content;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  return next;
}

function rewriteLegacyLinksInDocs() {
  const docsFiles = readDirFilesRecursive(path.join(repoRoot, 'apps/platform/content/docs'), ['.md', '.mdx']);
  for (const filePath of docsFiles) {
    const current = fs.readFileSync(filePath, 'utf8');
    const rewritten = normalizeLegacyLinks(current);
    if (rewritten !== current) {
      fs.writeFileSync(filePath, rewritten, 'utf8');
    }
  }
}

function generateAtoms() {
  const outputDir = path.join(docsComponentsDir, 'atoms');
  ensureDir(outputDir);

  const sourceFiles = fs
    .readdirSync(atomsSourceDir)
    .filter((name) => name.endsWith('.tsx'))
    .sort((a, b) => a.localeCompare(b));

  const entries = sourceFiles.map((filename) => {
    const name = filename.replace(/\.tsx$/, '');
    const slug = toKebabCase(name);
    const title = toTitle(name);
    const sourcePath = path.join('packages/ui/src/components/ui', filename).replace(/\\/g, '/');

    writeText(
      path.join(outputDir, `${slug}.mdx`),
      docTemplate({
        title,
        description: `UI atom from @forge/ui (${slug}).`,
        icon: 'Component',
        demoId: `ui.${slug}`,
        importSnippet: `import * as UI from '@forge/ui/${slug}';`,
        sourcePath,
      }),
    );

    return { slug, title };
  });

  writeText(
    path.join(outputDir, 'index.mdx'),
    indexTemplate({
      title: 'Atoms',
      description: 'Base UI primitives from @forge/ui.',
      links: entries,
    }),
  );

  writeJson(path.join(outputDir, 'meta.json'), {
    title: 'Atoms',
    pages: ['index', ...entries.map((entry) => entry.slug)],
  });

  return entries;
}

function generateEditor() {
  const outputDir = path.join(docsComponentsDir, 'editor');
  ensureDir(outputDir);

  const sourceFiles = readDirFilesRecursive(editorSourceDir, ['.tsx'])
    .filter((filePath) => !filePath.endsWith('index.tsx'))
    .sort((a, b) => a.localeCompare(b));

  const entries = sourceFiles.map((filePath) => {
    const relative = path.relative(editorSourceDir, filePath).replace(/\\/g, '/');
    const basename = path.basename(relative, '.tsx');
    const slug = normalizeEditorSlug(relative);
    const title = toTitle(relative.replace(/\.tsx$/, ''));

    writeText(
      path.join(outputDir, `${slug}.mdx`),
      docTemplate({
        title,
        description: `Editor platform component from @forge/shared (${basename}).`,
        icon: 'PanelsTopLeft',
        demoId: `editor.${slug}`,
        importSnippet: "import * as Editor from '@forge/shared/components/editor';",
        sourcePath: path.join('packages/shared/src/shared/components/editor', relative).replace(/\\/g, '/'),
      }),
    );

    return { slug, title };
  });

  writeText(
    path.join(outputDir, 'index.mdx'),
    indexTemplate({
      title: 'Editor Components',
      description: 'Dock layout, shell, toolbar, panels, and editor UI composition primitives.',
      links: entries,
    }),
  );

  writeJson(path.join(outputDir, 'meta.json'), {
    title: 'Editor Components',
    pages: ['index', ...entries.map((entry) => entry.slug)],
  });

  return entries;
}

function generateAssistantUi() {
  const outputDir = path.join(docsComponentsDir, 'assistant-ui');
  ensureDir(outputDir);

  const sourceFiles = readDirFilesRecursive(assistantSourceDir, ['.tsx'])
    .filter((filePath) => !filePath.endsWith('index.tsx'))
    .sort((a, b) => a.localeCompare(b));

  const entries = sourceFiles.map((filePath) => {
    const relative = path.relative(assistantSourceDir, filePath).replace(/\\/g, '/');
    const slug = toKebabCase(relative.replace(/\.tsx$/, '').replace(/\//g, '-'));
    const title = toTitle(relative.replace(/\.tsx$/, ''));

    writeText(
      path.join(outputDir, `${slug}.mdx`),
      docTemplate({
        title,
        description: 'Assistant UI component from @forge/shared assistant-ui.',
        icon: 'MessagesSquare',
        demoId: `assistant-ui.${slug}`,
        importSnippet: "import * as AssistantUI from '@forge/shared/components/assistant-ui';",
        sourcePath: path.join('packages/shared/src/shared/components/assistant-ui', relative).replace(/\\/g, '/'),
      }),
    );

    return { slug, title };
  });

  writeText(
    path.join(outputDir, 'index.mdx'),
    indexTemplate({
      title: 'Assistant UI',
      description: 'Chat threads, attachments, tool wrappers, and assistant presentation components.',
      links: entries,
    }),
  );

  writeJson(path.join(outputDir, 'meta.json'), {
    title: 'Assistant UI',
    pages: ['index', ...entries.map((entry) => entry.slug)],
  });

  return entries;
}

function generateToolUi() {
  const outputDir = path.join(docsComponentsDir, 'tool-ui');
  ensureDir(outputDir);

  const families = fs
    .readdirSync(toolUiSourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const entries = families.map((family) => {
    const slug = toKebabCase(family);
    const title = toTitle(family);

    writeText(
      path.join(outputDir, `${slug}.mdx`),
      docTemplate({
        title,
        description: `Tool UI family from @forge/shared (${family}).`,
        icon: 'Wrench',
        demoId: `tool-ui.${slug}`,
        importSnippet: "import * as ToolUI from '@forge/shared/components/tool-ui';",
        sourcePath: path.join('packages/shared/src/shared/components/tool-ui', family).replace(/\\/g, '/'),
      }),
    );

    return { slug, title };
  });

  writeText(
    path.join(outputDir, 'index.mdx'),
    indexTemplate({
      title: 'Tool UI',
      description: 'Structured tool outputs rendered in assistant flows (plan, terminal, charts, media, and more).',
      links: entries,
    }),
  );

  writeJson(path.join(outputDir, 'meta.json'), {
    title: 'Tool UI',
    pages: ['index', ...entries.map((entry) => entry.slug)],
  });

  return entries;
}

function generateRootComponentsIndex(counts) {
  writeText(
    path.join(docsComponentsDir, 'index.mdx'),
    `---
title: Component Showcase
description: Complete Forge component catalog across atoms, editor platform, assistant UI, and tool UI.
icon: Component
---

# Component Showcase

This catalog is generated from the source tree and kept in sync with platform docs tooling.

## Catalog sections

- [Showcase](./showcase): shared examples with Preview/Code BlockView
- [Atoms](./atoms): ${counts.atoms} components from @forge/ui
- [Editor Components](./editor): ${counts.editor} components from @forge/shared editor
- [Assistant UI](./assistant-ui): ${counts.assistant} components from @forge/shared assistant-ui
- [Tool UI](./tool-ui): ${counts.toolUi} tool UI families from @forge/shared tool-ui

## Legacy references

Deep-dive legacy component guides remain available for compatibility:

- [Editor Shell](./editor-shell)
- [Dock Layout](./dock-layout)
- [Dock Panel](./dock-panel)
- [Editor Toolbar](./editor-toolbar)
- [Editor Inspector](./editor-inspector)
- [Editor Overlay](./editor-overlay)
- [Panel Tabs](./panel-tabs)
- [Settings System](./settings-system)
`,
  );

  writeJson(path.join(docsComponentsDir, 'meta.json'), {
    title: 'Component Reference',
    pages: [
      'index',
      'showcase',
      'atoms',
      'editor',
      'assistant-ui',
      'tool-ui',
      'editor-shell',
      'dock-layout',
      'dock-panel',
      'editor-toolbar',
      'editor-inspector',
      'editor-overlay',
      'panel-tabs',
      'settings-system',
    ],
  });
}

function writeGeneratedDemoIds({ atoms, editor, assistant, toolUi }) {
  const ids = [
    ...atoms.map((entry) => `ui.${entry.slug}`),
    ...editor.map((entry) => `editor.${entry.slug}`),
    ...assistant.map((entry) => `assistant-ui.${entry.slug}`),
    ...toolUi.map((entry) => `tool-ui.${entry.slug}`),
  ].sort((a, b) => a.localeCompare(b));

  const idsBody = ids.map((id) => `  '${id}',`).join('\n');

  writeText(
    componentDemoIdsOutputPath,
    `/* eslint-disable */
// Generated by scripts/generate-platform-component-docs.mjs
// Do not edit manually.

export const COMPONENT_DEMO_IDS = [
${idsBody}
] as const;

export type ComponentDemoId = (typeof COMPONENT_DEMO_IDS)[number];
`,
  );
}

function main() {
  rewriteLegacyLinksInDocs();

  const atoms = generateAtoms();
  const editor = generateEditor();
  const assistant = generateAssistantUi();
  const toolUi = generateToolUi();

  generateRootComponentsIndex({
    atoms: atoms.length,
    editor: editor.length,
    assistant: assistant.length,
    toolUi: toolUi.length,
  });

  writeGeneratedDemoIds({
    atoms,
    editor,
    assistant,
    toolUi,
  });

  process.stdout.write(
    `[generate-platform-component-docs] generated atoms=${atoms.length} editor=${editor.length} assistant=${assistant.length} tool-ui=${toolUi.length}\n`,
  );
}

main();
