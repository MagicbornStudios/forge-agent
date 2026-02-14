#!/usr/bin/env node

/**
 * Reads _showcase-code-map.json and pulls source code from mapped files.
 * Writes catalog-code.generated.mjs for use by catalog.ts.
 *
 * Map value: string = single file, array = multiple files.
 * Edit _showcase-code-map.json to add demoId -> sourcePath (or array of paths).
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const showcaseDir = path.join(repoRoot, 'packages/shared/src/shared/components/docs/showcase');
const mapPath = path.join(showcaseDir, '_showcase-code-map.json');
const outputPath = path.join(showcaseDir, 'catalog-code.generated.mjs');

const registryPrefix = 'packages/shared/src/shared/components/docs/showcase/registry/';
const readmesDir = path.join(showcaseDir, 'readmes');

/** One-off: demoId -> platform MDX path. README content read from readmes/{demoId}.md (populated from MDX once). */
const README_DEMO_IDS = [
  'editor-shell-demo',
  'dock-layout-demo',
  'dock-panel-demo',
  'editor-toolbar-demo',
  'editor-inspector-demo',
  'editor-overlay-demo',
  'panel-tabs-demo',
  'settings-system-demo',
];

const MDX_SOURCES = {
  'editor-shell-demo': 'apps/platform/content/docs/components/editor-shell.mdx',
  'dock-layout-demo': 'apps/platform/content/docs/components/dock-layout.mdx',
  'dock-panel-demo': 'apps/platform/content/docs/components/dock-panel.mdx',
  'editor-toolbar-demo': 'apps/platform/content/docs/components/editor-toolbar.mdx',
  'editor-inspector-demo': 'apps/platform/content/docs/components/editor-inspector.mdx',
  'editor-overlay-demo': 'apps/platform/content/docs/components/editor-overlay.mdx',
  'panel-tabs-demo': 'apps/platform/content/docs/components/panel-tabs.mdx',
  'settings-system-demo': 'apps/platform/content/docs/components/settings-system.mdx',
};

function mdxToMarkdown(raw) {
  let out = raw
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/m, '')
    .replace(/\nimport\s+.*?from\s+['\"][^'\"]+['\"];?\s*\n/g, '\n')
    .replace(/<ComponentDemo\s+id="[^"]+"\s*\/>\s*\n?/g, '');
  return out.trim();
}

function ensureReadmes() {
  if (!fs.existsSync(readmesDir)) fs.mkdirSync(readmesDir, { recursive: true });
  for (const [demoId, mdxPath] of Object.entries(MDX_SOURCES)) {
    const readmePath = path.join(readmesDir, `${demoId}.md`);
    if (fs.existsSync(readmePath)) continue;
    const fullMdx = path.join(repoRoot, mdxPath.replace(/\//g, path.sep));
    if (!fs.existsSync(fullMdx)) continue;
    const raw = fs.readFileSync(fullMdx, 'utf8');
    const markdown = mdxToMarkdown(raw);
    fs.writeFileSync(readmePath, markdown, 'utf8');
    process.stderr.write(`[generate-showcase-code] wrote readme: ${demoId}.md\n`);
  }
}

const HARNESS_COMMENTS = {
  ShowcaseDemoSurface:
    '// ShowcaseDemoSurface: docs-only styled container for preview. In your app, wrap in your layout (e.g. a simple div or card).\n',
  AssistantDemoHarness:
    '// AssistantDemoHarness: docs-only mock runtime (useLocalRuntime) for preview. In your app, use AssistantRuntimeProvider with your chat backend (e.g. /api/assistant-chat).\n',
};

function transformCode(code) {
  let out = code;
  const comments = [];

  if (out.includes('ShowcaseDemoSurface')) {
    comments.push(HARNESS_COMMENTS.ShowcaseDemoSurface);
  }
  if (out.includes('AssistantDemoHarness')) {
    comments.push(HARNESS_COMMENTS.AssistantDemoHarness);
  }

  // Rewrite imports for consumer-friendly display
  out = out.replace(/from ['"]@forge\/shared['"]/g, "from '@forge/dev-kit'");
  out = out.replace(
    /import \* as UI from ['"]@forge\/ui['"]/g,
    "import { ui } from '@forge/dev-kit'",
  );
  out = out.replace(/\bUI\./g, 'ui.'); // UI.Tabs -> ui.Tabs, etc.
  out = out.replace(
    /from ['"][^'"]*copilot\/generative-ui['"]/g,
    "from '@forge/dev-kit'",
  );

  if (comments.length > 0) {
    out = comments.join('') + '\n' + out;
  }

  return out;
}

function getLanguage(ext) {
  if (ext === '.tsx') return 'tsx';
  if (ext === '.ts') return 'ts';
  if (ext === '.jsx') return 'jsx';
  return 'js';
}

function relativeDisplayPath(sourcePath) {
  if (sourcePath.startsWith(registryPrefix)) {
    return `registry/${sourcePath.slice(registryPrefix.length)}`;
  }
  return path.basename(sourcePath);
}

function consumerSnippetPath(displayPath) {
  const lastSlash = displayPath.lastIndexOf('/');
  const dir = lastSlash >= 0 ? displayPath.slice(0, lastSlash + 1) : '';
  const base = lastSlash >= 0 ? displayPath.slice(lastSlash + 1) : displayPath;
  const baseName = path.basename(base, path.extname(base));
  return `${dir}${baseName}.consumer.example.tsx`;
}

function generateConsumerSnippet(demoId, rawCode, displayPath) {
  const applyImportRewrites = (code) => {
    let out = code
      .replace(/from ['"]@forge\/shared['"]/g, "from '@forge/dev-kit'")
      .replace(/import \* as UI from ['"]@forge\/ui['"]/g, "import { ui } from '@forge/dev-kit'")
      .replace(/\bUI\./g, 'ui.')
      .replace(/from ['"][^'"]*copilot\/generative-ui['"]/g, "from '@forge/dev-kit'");
    return out;
  };

  if (rawCode.includes('AssistantDemoHarness') && !rawCode.includes('ComposerAddAttachment')) {
    return `'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@forge/dev-kit';
// Use your chat adapter (e.g. connect to /api/assistant-chat)

export function AssistantPanel() {
  return (
    <AssistantRuntimeProvider runtime={/* your runtime */}>
      <div className="rounded-lg border border-border p-4">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
`;
  }

  if (demoId === 'codebase-agent-strategy-editor') {
    return `'use client';

import { CodebaseAgentStrategyEditor } from '@forge/dev-kit';

export function StrategyEditor() {
  return (
    <div className="h-[480px] rounded-lg border border-border">
      <CodebaseAgentStrategyEditor />
    </div>
  );
}
`;
  }

  if (rawCode.includes('ComposerAddAttachment')) {
    return `'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { ComposerAddAttachment, Thread } from '@forge/dev-kit';
// Use your chat adapter (e.g. connect to /api/assistant-chat)

export function ChatWithAttachments() {
  return (
    <AssistantRuntimeProvider runtime={/* your runtime */}>
      <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
        <Thread composerLeading={<ComposerAddAttachment />} />
      </div>
    </AssistantRuntimeProvider>
  );
}
`;
  }

  // ShowcaseDemoSurface demos: replace with simple div, remove harness import
  let snippet = rawCode
    .replace(/\nimport\s*\{[^}]*\}\s*from\s*['\"][^'\"]*harnesses['\"];?\s*\n?/g, '\n')
    .replace(/<ShowcaseDemoSurface[^>]*>/g, '<div className="rounded-lg border border-border p-4">')
    .replace(/<\/ShowcaseDemoSurface>/g, '</div>');
  snippet = applyImportRewrites(snippet);
  return snippet;
}

function main() {
  ensureReadmes();
  let map = {};
  if (fs.existsSync(mapPath)) {
    const raw = fs.readFileSync(mapPath, 'utf8');
    map = JSON.parse(raw);
  }

  const output = {};
  for (const [demoId, sourcePathOrPaths] of Object.entries(map)) {
    const paths = Array.isArray(sourcePathOrPaths) ? sourcePathOrPaths : [sourcePathOrPaths];
    const files = [];

    for (const sourcePath of paths) {
      if (typeof sourcePath !== 'string') continue;
      const fullPath = path.join(repoRoot, sourcePath.replace(/\//g, path.sep));
      if (!fs.existsSync(fullPath)) {
        process.stderr.write(`[generate-showcase-code] skip: ${demoId} - file not found: ${sourcePath}\n`);
        continue;
      }
      const rawCode = fs.readFileSync(fullPath, 'utf8');
      const basename = path.basename(sourcePath);
      const ext = path.extname(basename);
      const displayPath = relativeDisplayPath(sourcePath);
      const code = transformCode(rawCode);
      files.push({
        path: displayPath,
        language: getLanguage(ext),
        code,
      });
      const snippet = generateConsumerSnippet(demoId, rawCode, displayPath);
      files.push({
        path: consumerSnippetPath(displayPath),
        language: 'tsx',
        code: snippet,
      });
    }

    if (README_DEMO_IDS.includes(demoId)) {
      const readmePath = path.join(readmesDir, `${demoId}.md`);
      if (fs.existsSync(readmePath)) {
        const readmeCode = fs.readFileSync(readmePath, 'utf8');
        const firstPath = files.length > 0 ? files[0].path : '';
        const dir = firstPath.includes('/') ? firstPath.replace(/\/[^/]+$/, '') : '';
        const readmeDisplayPath = dir ? `${dir}/README.md` : 'README.md';
        files.unshift({ path: readmeDisplayPath, language: 'md', code: readmeCode });
      }
    }

    if (files.length > 0) {
      output[demoId] = files;
    }
  }

  const content = `/** Generated by scripts/generate-showcase-code.mjs - do not edit */\n\nexport const SHOWCASE_CODE_BY_DEMO_ID = ${JSON.stringify(output, null, 2)};\n`;
  fs.writeFileSync(outputPath, content, 'utf8');
  process.stdout.write(`[generate-showcase-code] wrote ${Object.keys(output).length} demo(s) to catalog-code.generated.mjs\n`);
}

main();
