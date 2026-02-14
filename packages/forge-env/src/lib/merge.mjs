import { isValueSet } from './io.mjs';
import { asSourceEntries, collectUnionKeys } from './sources.mjs';

function unique(items) {
  return [...new Set(items)];
}

function redactExampleValue(value, entry) {
  if (entry?.secret === true) return '';
  if (!isValueSet(value)) {
    return entry?.exampleDefault ?? '';
  }
  return value;
}

function chooseValue(key, entriesForKey, sources, writePolicy) {
  const map = new Map(entriesForKey.map((entry) => [entry.key, entry]));
  const entry = map.get(key);

  for (const source of sources) {
    const value = source.values?.[key];
    if (isValueSet(value)) {
      return {
        value,
        source: source.id,
        entry,
      };
    }
  }

  const fallback = entry?.exampleDefault ?? '';
  if (!isValueSet(fallback) && writePolicy?.preserveNonEmpty) {
    return {
      value: '',
      source: 'empty',
      entry,
    };
  }

  return {
    value: fallback,
    source: entry ? 'entry.default' : 'empty',
    entry,
  };
}

function detectConflicts(key, sources) {
  const nonEmpty = [];
  for (const source of sources) {
    const value = source.values?.[key];
    if (isValueSet(value)) {
      nonEmpty.push({ source: source.id, value });
    }
  }

  const uniqueValues = unique(nonEmpty.map((item) => item.value));
  if (uniqueValues.length <= 1) return null;

  return {
    key,
    values: nonEmpty,
  };
}

export function buildMergedTargetState({ targetEntries, targetFiles, rootFiles, overrides, writePolicy }) {
  const sources = asSourceEntries(targetFiles, rootFiles, overrides || {});
  const unionKeys = collectUnionKeys(targetEntries, targetFiles, rootFiles);

  const mergedValues = {};
  const exampleValues = {};
  const provenance = {};
  const conflicts = [];

  for (const key of unionKeys) {
    const choice = chooseValue(key, targetEntries, sources, writePolicy || {});
    mergedValues[key] = choice.value;
    provenance[key] = choice.source;
    exampleValues[key] = redactExampleValue(choice.value, choice.entry);
    const conflict = detectConflicts(key, sources);
    if (conflict) conflicts.push(conflict);
  }

  return {
    sources,
    unionKeys,
    mergedValues,
    exampleValues,
    provenance,
    conflicts,
  };
}
