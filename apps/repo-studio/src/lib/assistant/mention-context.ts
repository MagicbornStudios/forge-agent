import path from 'node:path';
import type { PlanningDocEntry } from '@/lib/repo-data';

export type PlanningMentionContext = {
  mentions: string[];
  resolved: Array<{
    mention: string;
    docId: string;
    filePath: string;
    clipped: boolean;
  }>;
  ignored: string[];
  contextBlock: string;
};

const MENTION_REGEX = /@planning\/([a-zA-Z0-9._:/-]+)/g;
const DEFAULT_MAX_MENTIONS = 4;
const DEFAULT_MAX_DOC_CHARS = 2200;
const DEFAULT_MAX_TOTAL_CHARS = 7000;

function slugify(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/[^a-z0-9._:/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripMarkdownSuffix(value: string) {
  return String(value || '').replace(/\.md$/i, '');
}

function mentionCandidates(doc: PlanningDocEntry) {
  const fileName = path.basename(doc.filePath);
  return new Set([
    slugify(doc.id),
    slugify(doc.title),
    slugify(doc.filePath),
    slugify(stripMarkdownSuffix(doc.id)),
    slugify(stripMarkdownSuffix(doc.title)),
    slugify(stripMarkdownSuffix(doc.filePath)),
    slugify(fileName),
    slugify(stripMarkdownSuffix(fileName)),
  ]);
}

function clipText(input: string, maxChars: number) {
  const text = String(input || '');
  if (text.length <= maxChars) return { text, clipped: false };
  return {
    text: `${text.slice(0, Math.max(0, maxChars)).trimEnd()}\n\n...[clipped]`,
    clipped: true,
  };
}

export function parsePlanningMentions(text: string) {
  const matches: string[] = [];
  const source = String(text || '');
  let match: RegExpExecArray | null;
  while ((match = MENTION_REGEX.exec(source)) !== null) {
    const token = slugify(match[1] || '');
    if (!token) continue;
    if (!matches.includes(token)) matches.push(token);
  }
  return matches;
}

export function resolvePlanningMentionContext(input: {
  text: string;
  docs: PlanningDocEntry[];
  maxMentions?: number;
  maxDocChars?: number;
  maxTotalChars?: number;
}): PlanningMentionContext {
  const mentions = parsePlanningMentions(input.text);
  if (mentions.length === 0) {
    return {
      mentions: [],
      resolved: [],
      ignored: [],
      contextBlock: '',
    };
  }

  const maxMentions = Number.isInteger(input.maxMentions)
    ? Number(input.maxMentions)
    : DEFAULT_MAX_MENTIONS;
  const maxDocChars = Number.isInteger(input.maxDocChars)
    ? Number(input.maxDocChars)
    : DEFAULT_MAX_DOC_CHARS;
  const maxTotalChars = Number.isInteger(input.maxTotalChars)
    ? Number(input.maxTotalChars)
    : DEFAULT_MAX_TOTAL_CHARS;

  const docsByCandidate = new Map<string, PlanningDocEntry>();
  for (const doc of input.docs || []) {
    for (const candidate of mentionCandidates(doc)) {
      if (!candidate || docsByCandidate.has(candidate)) continue;
      docsByCandidate.set(candidate, doc);
    }
  }

  const resolved: PlanningMentionContext['resolved'] = [];
  const ignored: string[] = [];
  const parts: string[] = [];
  let totalChars = 0;

  for (const mention of mentions.slice(0, maxMentions)) {
    const doc = docsByCandidate.get(mention);
    if (!doc) {
      ignored.push(mention);
      continue;
    }
    const remaining = maxTotalChars - totalChars;
    if (remaining <= 0) break;
    const limit = Math.max(0, Math.min(maxDocChars, remaining));
    const clipped = clipText(doc.content, limit);
    totalChars += clipped.text.length;
    resolved.push({
      mention,
      docId: doc.id,
      filePath: doc.filePath,
      clipped: clipped.clipped,
    });
    parts.push(
      `### @planning/${mention}`,
      `source: ${doc.filePath}`,
      '```md',
      clipped.text,
      '```',
    );
  }

  return {
    mentions,
    resolved,
    ignored,
    contextBlock: parts.length > 0
      ? ['## Mentioned Planning Context', ...parts].join('\n\n')
      : '',
  };
}
