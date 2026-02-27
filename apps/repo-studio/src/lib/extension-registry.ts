import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import type {
  RepoWorkspaceExtension,
  RepoWorkspaceRegistryEntry,
  RepoWorkspaceRegistryExample,
} from '@/lib/api/types';
import {
  EXTENSIONS_RELATIVE_DIR,
  loadRepoWorkspaceExtensions,
  loadWorkspaceExtensionsFromDirectory,
} from '@/lib/workspace-extensions';
import { resolveActiveProjectRoot, resolveHostWorkspaceRoot } from '@/lib/project-root';

const REGISTRY_BASE_RELATIVE_DIR = path.join('vendor', 'repo-studio-extensions');
const REGISTRY_INSTALLABLES_RELATIVE_DIR = path.join(REGISTRY_BASE_RELATIVE_DIR, 'extensions');
const REGISTRY_EXAMPLES_RELATIVE_DIR = path.join(REGISTRY_BASE_RELATIVE_DIR, 'examples', 'studios');
const SAFE_EXTENSION_ID = /^[a-z0-9][a-z0-9._-]*$/i;
const STUDIO_EXAMPLE_FILE = 'example.json';

function normalizeExtensionId(value: unknown) {
  return String(value || '').trim();
}

function resolveRegistryBaseRoot(hostRoot: string) {
  return path.join(hostRoot, REGISTRY_BASE_RELATIVE_DIR);
}

function resolveRegistryExtensionsRoot(hostRoot: string) {
  return path.join(hostRoot, REGISTRY_INSTALLABLES_RELATIVE_DIR);
}

function resolveRegistryExamplesRoot(hostRoot: string) {
  return path.join(hostRoot, REGISTRY_EXAMPLES_RELATIVE_DIR);
}

function resolveInstalledExtensionsRoot(activeRoot: string) {
  return path.join(activeRoot, EXTENSIONS_RELATIVE_DIR);
}

function assertSafeExtensionId(value: unknown) {
  const id = normalizeExtensionId(value);
  if (!id || !SAFE_EXTENSION_ID.test(id)) {
    throw new Error('extensionId is required and must be alphanumeric with . _ - only.');
  }
  return id;
}

function pathExists(inputPath: string) {
  try {
    return fs.existsSync(inputPath);
  } catch {
    return false;
  }
}

function toRegistryEntry(input: {
  extension: RepoWorkspaceExtension;
  installed: RepoWorkspaceExtension | null;
}): RepoWorkspaceRegistryEntry {
  return {
    id: input.extension.id,
    label: input.extension.label,
    workspaceId: input.extension.workspaceId,
    workspaceKind: input.extension.workspaceKind,
    description: input.extension.description,
    manifestPath: input.extension.manifestPath,
    ...(input.extension.layoutSpecPath ? { layoutSpecPath: input.extension.layoutSpecPath } : {}),
    ...(input.extension.layout ? { layout: input.extension.layout } : {}),
    ...(input.extension.assistant ? { assistant: input.extension.assistant } : {}),
    installed: input.installed != null,
    installedManifestPath: input.installed?.manifestPath || null,
  };
}

function toRegistryPath(hostRoot: string, filePath: string) {
  return path.relative(hostRoot, filePath).replace(/\\/g, '/');
}

function normalizeString(value: unknown) {
  return String(value || '').trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function parseExampleMetadata(input: {
  hostRoot: string;
  metadataPathAbs: string;
  body: unknown;
  warnings: string[];
}): RepoWorkspaceRegistryExample | null {
  const record = asRecord(input.body);
  const id = normalizeString(record.id);
  const label = normalizeString(record.label);
  const category = normalizeString(record.category).toLowerCase();
  const summary = normalizeString(record.summary);
  const sourceRepoUrl = normalizeString(record.sourceRepoUrl);
  const sourcePath = normalizeString(record.sourcePath);
  const docsUrl = normalizeString(record.docsUrl);
  const tags = Array.isArray(record.tags)
    ? record.tags.map((entry) => normalizeString(entry)).filter(Boolean)
    : [];
  const metadataPath = toRegistryPath(input.hostRoot, input.metadataPathAbs);

  if (!id || !SAFE_EXTENSION_ID.test(id)) {
    input.warnings.push(`Skipping ${metadataPath}: id is required and must be alphanumeric with . _ - only.`);
    return null;
  }
  if (!label) {
    input.warnings.push(`Skipping ${metadataPath}: label is required.`);
    return null;
  }
  if (category !== 'studio-example') {
    input.warnings.push(`Skipping ${metadataPath}: category must be "studio-example".`);
    return null;
  }
  if (!summary) {
    input.warnings.push(`Skipping ${metadataPath}: summary is required.`);
    return null;
  }
  if (!sourceRepoUrl) {
    input.warnings.push(`Skipping ${metadataPath}: sourceRepoUrl is required.`);
    return null;
  }
  if (!sourcePath) {
    input.warnings.push(`Skipping ${metadataPath}: sourcePath is required.`);
    return null;
  }

  return {
    id,
    label,
    category: 'studio-example',
    summary,
    sourceRepoUrl,
    sourcePath,
    ...(docsUrl ? { docsUrl } : {}),
    tags,
    metadataPath,
  };
}

async function listStudioExamples(input: {
  hostRoot: string;
  warnings: string[];
}) {
  const examplesRoot = resolveRegistryExamplesRoot(input.hostRoot);
  if (!pathExists(examplesRoot)) {
    input.warnings.push(
      `Registry examples directory missing at ${toRegistryPath(input.hostRoot, examplesRoot)}.`,
    );
    return [] as RepoWorkspaceRegistryExample[];
  }

  let directoryEntries: fs.Dirent[] = [];
  try {
    directoryEntries = await fsp.readdir(examplesRoot, { withFileTypes: true });
  } catch (error) {
    input.warnings.push(
      `Unable to read registry examples directory (${toRegistryPath(input.hostRoot, examplesRoot)}): ${String((error as Error)?.message || error)}.`,
    );
    return [] as RepoWorkspaceRegistryExample[];
  }

  const examples: RepoWorkspaceRegistryExample[] = [];
  const seenIds = new Set<string>();
  for (const entry of directoryEntries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const exampleDir = path.join(examplesRoot, entry.name);
    const metadataPathAbs = path.join(exampleDir, STUDIO_EXAMPLE_FILE);
    if (!pathExists(metadataPathAbs)) {
      input.warnings.push(`Skipping ${toRegistryPath(input.hostRoot, exampleDir)}: missing ${STUDIO_EXAMPLE_FILE}.`);
      continue;
    }

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(await fsp.readFile(metadataPathAbs, 'utf8'));
    } catch (error) {
      input.warnings.push(`Skipping ${toRegistryPath(input.hostRoot, metadataPathAbs)}: invalid JSON (${String((error as Error)?.message || error)}).`);
      continue;
    }

    const example = parseExampleMetadata({
      hostRoot: input.hostRoot,
      metadataPathAbs,
      body: parsed,
      warnings: input.warnings,
    });
    if (!example) continue;
    if (seenIds.has(example.id)) {
      input.warnings.push(`Skipping ${example.metadataPath}: duplicate studio example id "${example.id}".`);
      continue;
    }
    seenIds.add(example.id);
    examples.push(example);
  }

  return examples;
}

export async function listExtensionRegistry(input?: { activeRoot?: string; hostRoot?: string }) {
  const activeRoot = path.resolve(input?.activeRoot || resolveActiveProjectRoot());
  const hostRoot = path.resolve(input?.hostRoot || resolveHostWorkspaceRoot());
  const registryBaseRoot = resolveRegistryBaseRoot(hostRoot);
  const registryRoot = resolveRegistryExtensionsRoot(hostRoot);
  const submoduleReady = pathExists(registryBaseRoot);
  const warnings: string[] = [];

  const installed = await loadRepoWorkspaceExtensions({ repoRoot: activeRoot });
  const installedById = new Map(installed.extensions.map((extension) => [extension.id, extension]));
  const installedByWorkspaceId = new Map(installed.extensions.map((extension) => [extension.workspaceId, extension]));
  warnings.push(...installed.warnings);

  if (!submoduleReady) {
    warnings.push(
      `Extension registry not available at ${toRegistryPath(hostRoot, registryBaseRoot)}. Initialize submodules to browse installable extensions.`,
    );
    return {
      ok: true as const,
      activeRoot,
      registryRoot,
      submoduleReady: false,
      entries: [] as RepoWorkspaceRegistryEntry[],
      examples: [] as RepoWorkspaceRegistryExample[],
      warnings,
    };
  }

  const registry = await loadWorkspaceExtensionsFromDirectory({
    activeRoot: hostRoot,
    extensionsDir: registryRoot,
    allowBuiltInOverrides: true,
  });
  warnings.push(...registry.warnings);
  const examples = await listStudioExamples({
    hostRoot,
    warnings,
  });

  const entries = registry.extensions.map((extension) => {
    const installedMatch = installedById.get(extension.id)
      || installedByWorkspaceId.get(extension.workspaceId)
      || null;
    return toRegistryEntry({
      extension,
      installed: installedMatch,
    });
  });

  return {
    ok: true as const,
    activeRoot,
    registryRoot,
    submoduleReady: true,
    entries,
    examples,
    warnings,
  };
}

async function ensureInstalledExtensionSnapshot(input: {
  activeRoot: string;
  extensionId: string;
}) {
  const installed = await loadRepoWorkspaceExtensions({ repoRoot: input.activeRoot });
  const extension = installed.extensions.find((entry) => entry.id === input.extensionId) || null;
  return {
    extension,
    warnings: installed.warnings,
  };
}

export async function installExtensionFromRegistry(input: {
  extensionId: string;
  replace?: boolean;
  activeRoot?: string;
  hostRoot?: string;
}) {
  const extensionId = assertSafeExtensionId(input.extensionId);
  const activeRoot = path.resolve(input.activeRoot || resolveActiveProjectRoot());
  const hostRoot = path.resolve(input.hostRoot || resolveHostWorkspaceRoot());
  const registryBaseRoot = resolveRegistryBaseRoot(hostRoot);
  const registryRoot = resolveRegistryExtensionsRoot(hostRoot);

  if (!pathExists(registryBaseRoot)) {
    throw new Error(`Extension registry is not initialized at ${toRegistryPath(hostRoot, registryBaseRoot)}.`);
  }

  const registry = await loadWorkspaceExtensionsFromDirectory({
    activeRoot: hostRoot,
    extensionsDir: registryRoot,
    allowBuiltInOverrides: true,
  });
  const examples = await listStudioExamples({
    hostRoot,
    warnings: [],
  });

  const installable = registry.extensions.find((entry) => entry.id === extensionId) || null;
  if (!installable) {
    if (examples.some((entry) => entry.id === extensionId)) {
      throw new Error(`Extension "${extensionId}" is a studio example and cannot be installed.`);
    }
    throw new Error(`Extension "${extensionId}" was not found in registry.`);
  }
  const manifestAbsPath = path.resolve(hostRoot, installable.manifestPath);
  const registryDir = path.dirname(manifestAbsPath);
  if (!pathExists(registryDir)) {
    throw new Error(`Extension "${extensionId}" manifest exists but source directory is missing.`);
  }

  const installedRoot = resolveInstalledExtensionsRoot(activeRoot);
  const targetDir = path.join(installedRoot, extensionId);
  await fsp.mkdir(installedRoot, { recursive: true });
  const targetExists = pathExists(targetDir);
  if (targetExists && input.replace !== true) {
    throw new Error(`Extension "${extensionId}" is already installed. Re-run with replace=true to update.`);
  }
  if (targetExists && input.replace === true) {
    await fsp.rm(targetDir, { recursive: true, force: true });
  }

  await fsp.cp(registryDir, targetDir, {
    recursive: true,
    force: false,
    errorOnExist: false,
  });

  const snapshot = await ensureInstalledExtensionSnapshot({
    activeRoot,
    extensionId,
  });
  if (!snapshot.extension) {
    throw new Error(`Extension "${extensionId}" was copied but failed validation; check manifest/layout spec.`);
  }

  return {
    ok: true as const,
    activeRoot,
    extension: snapshot.extension,
    warnings: snapshot.warnings,
    message: input.replace === true
      ? `Updated extension "${extensionId}".`
      : `Installed extension "${extensionId}".`,
  };
}

export async function removeInstalledExtension(input: {
  extensionId: string;
  activeRoot?: string;
}) {
  const extensionId = assertSafeExtensionId(input.extensionId);
  const activeRoot = path.resolve(input.activeRoot || resolveActiveProjectRoot());
  const installedRoot = resolveInstalledExtensionsRoot(activeRoot);
  const targetDir = path.join(installedRoot, extensionId);
  if (!pathExists(targetDir)) {
    return {
      ok: true as const,
      activeRoot,
      removed: false,
      message: `Extension "${extensionId}" is not installed.`,
    };
  }

  await fsp.rm(targetDir, { recursive: true, force: true });
  return {
    ok: true as const,
    activeRoot,
    removed: true,
    message: `Removed extension "${extensionId}".`,
  };
}
