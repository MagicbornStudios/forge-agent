import { GENERATED_END_MARKER, GENERATED_START_MARKER } from './paths.mjs';

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractSectionsByHeading(markdown, headingLevel = 2) {
  const headingPrefix = '#'.repeat(headingLevel);
  const lines = String(markdown || '').split('\n');
  const sections = new Map();

  let currentName = null;
  let buffer = [];

  function flush() {
    if (!currentName) return;
    sections.set(currentName.trim(), buffer.join('\n').trim());
  }

  for (const line of lines) {
    const match = line.match(new RegExp(`^${headingPrefix}\\s+(.+)$`));
    if (match) {
      flush();
      currentName = match[1];
      buffer = [];
      continue;
    }

    if (currentName) buffer.push(line);
  }

  flush();
  return sections;
}

export function updateGeneratedBlock(content, generatedContent, startMarker = GENERATED_START_MARKER, endMarker = GENERATED_END_MARKER) {
  const safeGenerated = String(generatedContent || '').trim();
  const block = `${startMarker}\n${safeGenerated}\n${endMarker}`;
  const text = String(content || '');

  const startIdx = text.indexOf(startMarker);
  const endIdx = text.indexOf(endMarker);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = text.slice(0, startIdx).trimEnd();
    const after = text.slice(endIdx + endMarker.length).trimStart();
    const segments = [before, block, after].filter(Boolean);
    return `${segments.join('\n\n').trim()}\n`;
  }

  const joiner = text.trim().length > 0 ? '\n\n' : '';
  return `${text.trim()}${joiner}${block}\n`;
}

export function extractFrontmatter(markdown) {
  const text = String(markdown || '');
  if (!text.startsWith('---\n')) return { frontmatter: '', body: text };

  const endIndex = text.indexOf('\n---\n', 4);
  if (endIndex === -1) return { frontmatter: '', body: text };

  return {
    frontmatter: text.slice(4, endIndex),
    body: text.slice(endIndex + 5),
  };
}

export function parseScalarFrontmatter(frontmatterText) {
  const parsed = {};
  const lines = String(frontmatterText || '').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    parsed[key] = value;
  }

  return parsed;
}

export function parseSimpleList(markdown, pattern) {
  return String(markdown || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => pattern.test(line))
    .map((line) => line.replace(pattern, '$1').trim());
}
