#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, 'apps/docs/content/docs');
const showcaseVisibilityPath = path.join(
  repoRoot,
  'packages/shared/src/shared/components/docs/showcase/_showcase-visibility.json',
);

function readFilesRecursive(dir, exts) {
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
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
      if (!resolved.startsWith(docsRoot) || !existsDoc(resolved)) {
        failures.push(`${relDoc}: broken relative link "${href}"`);
      }
    }
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
