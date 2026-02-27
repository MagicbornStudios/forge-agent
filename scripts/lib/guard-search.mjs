#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const gitFileCache = new Map();

function toPosix(filePath) {
  return String(filePath || '').replaceAll('\\', '/');
}

function safeReadUtf8(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function listGitFiles(roots) {
  const normalizedRoots = Array.from(new Set((roots || ['.']).map((root) => toPosix(root).trim()).filter(Boolean)));
  const cacheKey = normalizedRoots.join('|');
  if (gitFileCache.has(cacheKey)) {
    return gitFileCache.get(cacheKey);
  }

  try {
    const output = execFileSync('git', ['ls-files', '--', ...normalizedRoots], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    const files = output
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => toPosix(line));
    gitFileCache.set(cacheKey, files);
    return files;
  } catch {
    gitFileCache.set(cacheKey, []);
    return [];
  }
}

function isExcluded(filePath, excludeSubpaths) {
  if (!Array.isArray(excludeSubpaths) || excludeSubpaths.length === 0) return false;
  const normalizedFile = toPosix(filePath);
  return excludeSubpaths.some((item) => {
    const normalizedItem = toPosix(item).trim();
    if (!normalizedItem) return false;
    return normalizedFile.includes(normalizedItem);
  });
}

function matchesExtensions(filePath, extensions) {
  if (!Array.isArray(extensions) || extensions.length === 0) return true;
  return extensions.some((ext) => filePath.endsWith(ext));
}

function indexToLineNumber(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

export function searchPattern(input) {
  const {
    pattern,
    roots = ['.'],
    extensions = [],
    excludeSubpaths = [],
    flags = 'gm',
  } = input || {};

  if (!pattern) return '';
  const regex = new RegExp(pattern, flags);
  const files = listGitFiles(roots)
    .filter((filePath) => matchesExtensions(filePath, extensions))
    .filter((filePath) => !isExcluded(filePath, excludeSubpaths));

  const matches = [];
  for (const relativePath of files) {
    const absolutePath = path.resolve(relativePath);
    const source = safeReadUtf8(absolutePath);
    if (source == null || source.length === 0) continue;

    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(source)) !== null) {
      const matchIndex = typeof match.index === 'number' ? match.index : 0;
      const lineNumber = indexToLineNumber(source, matchIndex);
      const lineText = source.split(/\r?\n/u)[lineNumber - 1] ?? '';
      matches.push(`${relativePath}:${lineNumber}:${lineText.trimEnd()}`);
      if (match[0] === '') {
        regex.lastIndex += 1;
      }
    }
  }

  return matches.join('\n').trim();
}
