import { getTargetPaths, rootTarget, selectTargets } from './discovery.mjs';
import { buildMergedTargetState } from './merge.mjs';
import { evaluateReadiness as evaluateReadinessInternal } from './readiness.mjs';
import { mergeObjects, readPathMap } from './sources.mjs';
import { writeTargetFiles } from './writers.mjs';

function unique(items) {
  return [...new Set(items)];
}

export async function collectProjectState(profileConfig, options = {}) {
  const root = rootTarget();
  const rootPaths = getTargetPaths(root);
  const rootFiles = await readPathMap(rootPaths);

  const selection = await selectTargets(profileConfig, { app: options.app });
  const targets = [];

  for (const target of selection.targets) {
    const targetPaths = getTargetPaths(target);
    const targetFiles = await readPathMap(targetPaths);
    const targetEntries = (profileConfig.entries || []).filter((entry) => entry.target === target.id);
    const overrideValues = options.overrides?.[target.id] || {};
    const merged = buildMergedTargetState({
      targetEntries,
      targetFiles,
      rootFiles,
      overrides: overrideValues,
      writePolicy: profileConfig.writePolicy || {},
    });

    targets.push({
      target,
      targetPaths,
      targetFiles,
      entries: targetEntries,
      ...merged,
    });
  }

  const valueUniverse = mergeObjects(
    mergeObjects(rootFiles.local?.values, rootFiles.env?.values),
    mergeObjects(rootFiles.development?.values, rootFiles.production?.values),
  );

  for (const target of targets) {
    Object.assign(valueUniverse, target.mergedValues);
  }

  return {
    profileConfig,
    rootFiles,
    targets,
    valueUniverse,
    discovery: selection.diagnostics,
  };
}

export function evaluateReadiness(state, mode, options = {}) {
  return evaluateReadinessInternal(state, mode, options);
}

export async function reconcileProject(profileConfig, options = {}) {
  const state = await collectProjectState(profileConfig, options);
  const readiness = evaluateReadiness(state, options.mode || 'local', {
    profileFallback: options.profileFallback,
  });

  const changed = [];
  const backups = [];
  const pending = [];

  for (const target of state.targets) {
    const result = await writeTargetFiles(target, {
      write: options.write === true,
      syncExamples: options.syncExamples === true,
      examplesOnly: options.examplesOnly === true,
      writePolicy: profileConfig.writePolicy,
    });
    pending.push(...result.pending);
    changed.push(...result.changed);
    backups.push(...result.backups);
  }

  return {
    state,
    readiness,
    pending: unique(pending),
    changed: unique(changed),
    backups: unique(backups),
  };
}
