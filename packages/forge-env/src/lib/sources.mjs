import { readEnvFile } from './io.mjs';

export async function readPathMap(paths) {
  const entries = await Promise.all(
    Object.entries(paths)
      .filter(([, filePath]) => Boolean(filePath))
      .map(async ([name, filePath]) => [name, await readEnvFile(filePath)]),
  );
  return Object.fromEntries(entries);
}

export function collectUnionKeys(targetEntries, targetFiles, rootFiles) {
  const keys = new Set();

  for (const entry of targetEntries || []) {
    keys.add(entry.key);
  }

  for (const source of [...Object.values(targetFiles || {}), ...Object.values(rootFiles || {})]) {
    for (const key of Object.keys(source.values || {})) {
      keys.add(key);
    }
  }

  return [...keys].sort((a, b) => a.localeCompare(b));
}

export function asSourceEntries(targetFiles, rootFiles, overrides = {}) {
  return [
    { id: 'override', values: overrides },
    { id: 'target.local', values: targetFiles.local?.values || {} },
    { id: 'target.env', values: targetFiles.env?.values || {} },
    { id: 'target.development', values: targetFiles.development?.values || {} },
    { id: 'target.production', values: targetFiles.production?.values || {} },
    { id: 'root.local', values: rootFiles.local?.values || {} },
    { id: 'root.env', values: rootFiles.env?.values || {} },
    { id: 'root.development', values: rootFiles.development?.values || {} },
    { id: 'root.production', values: rootFiles.production?.values || {} },
    { id: 'target.example', values: targetFiles.example?.values || {} },
    { id: 'root.example', values: rootFiles.example?.values || {} },
  ];
}

export function mergeObjects(base, patch) {
  return {
    ...(base || {}),
    ...(patch || {}),
  };
}
