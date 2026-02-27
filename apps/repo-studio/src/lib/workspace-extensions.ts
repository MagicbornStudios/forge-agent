import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import type {
  RepoWorkspaceExtension,
  RepoWorkspaceExtensionAboutWorkspace,
  RepoWorkspaceExtensionForgeTool,
  RepoWorkspaceExtensionKind,
  RepoWorkspaceExtensionLayoutPanelSpec,
  RepoWorkspaceExtensionLayoutSpec,
  RepoWorkspaceExtensionManifest,
  RepoWorkspaceExtensionPanelRail,
} from '@/lib/api/types';
import { WORKSPACE_IDS as BUILTIN_WORKSPACE_IDS } from '@/lib/app-spec.generated';
import { resolveActiveProjectRoot } from '@/lib/project-root';

export const EXTENSIONS_RELATIVE_DIR = '.repo-studio/extensions';
export const EXTENSION_MANIFEST_FILE = 'manifest.json';

const PANEL_RAILS: ReadonlySet<RepoWorkspaceExtensionPanelRail> = new Set([
  'left',
  'main',
  'right',
  'bottom',
]);

const ALLOWED_BUILTIN_WORKSPACE_OVERRIDES = new Set(['story']);
const BUILTIN_WORKSPACE_ID_SET = new Set(BUILTIN_WORKSPACE_IDS.map((id) => String(id || '').trim()));

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function normalizeString(value: unknown) {
  return String(value || '').trim();
}

function normalizeManifestPath(baseRoot: string, filePath: string) {
  return path.relative(baseRoot, filePath).replace(/\\/g, '/');
}

function parseWorkspaceKind(value: unknown): RepoWorkspaceExtensionKind {
  const normalized = normalizeString(value).toLowerCase();
  if (normalized === 'story') return 'story';
  if (normalized === 'env') return 'env';
  return 'generic';
}

function parseAboutWorkspace(value: unknown): RepoWorkspaceExtensionAboutWorkspace | undefined {
  const record = asRecord(value);
  const title = normalizeString(record.title);
  const summary = normalizeString(record.summary);
  const context = Array.isArray(record.context)
    ? record.context.map((entry) => normalizeString(entry)).filter(Boolean)
    : [];
  if (!title && !summary && context.length === 0) return undefined;
  return {
    title,
    summary,
    context,
  };
}

function parseForgeTools(value: unknown): RepoWorkspaceExtensionForgeTool[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asRecord(entry))
    .map((entry) => ({
      name: normalizeString(entry.name),
      action: normalizeString(entry.action),
      label: normalizeString(entry.label),
      description: normalizeString(entry.description),
    }))
    .filter((entry) => entry.name && entry.action && entry.label && entry.description);
}

function normalizePanelSpec(value: unknown): RepoWorkspaceExtensionLayoutPanelSpec | null {
  const record = asRecord(value);
  const id = normalizeString(record.id);
  const label = normalizeString(record.label || record.title || id);
  const rail = normalizeString(record.rail).toLowerCase() as RepoWorkspaceExtensionPanelRail;
  if (!id || !label || !PANEL_RAILS.has(rail)) return null;
  const key = normalizeString(record.key);
  return {
    id,
    label,
    rail,
    ...(key ? { key } : {}),
  };
}

export function normalizeExtensionLayoutSpec(
  value: unknown,
  workspaceId: string,
): RepoWorkspaceExtensionLayoutSpec | undefined {
  const record = asRecord(value);
  const panelSpecs = Array.isArray(record.panelSpecs)
    ? record.panelSpecs.map(normalizePanelSpec).filter((panel): panel is RepoWorkspaceExtensionLayoutPanelSpec => panel != null)
    : [];
  if (panelSpecs.length === 0) return undefined;

  const allowedPanelIds = new Set(panelSpecs.map((panel) => panel.id));
  const explicitMainPanelIds = Array.isArray(record.mainPanelIds)
    ? record.mainPanelIds.map((id) => normalizeString(id)).filter((id) => allowedPanelIds.has(id))
    : [];
  const autoMainPanelIds = panelSpecs.filter((panel) => panel.rail === 'main').map((panel) => panel.id);
  const mainPanelIds = explicitMainPanelIds.length > 0 ? explicitMainPanelIds : autoMainPanelIds;
  if (mainPanelIds.length === 0) return undefined;

  const mainAnchorPanelId = normalizeString(record.mainAnchorPanelId);
  const anchor = mainPanelIds.includes(mainAnchorPanelId) ? mainAnchorPanelId : mainPanelIds[0];
  const layoutWorkspaceId = normalizeString(record.workspaceId || workspaceId) || workspaceId;
  const layoutId = normalizeString(record.layoutId);
  return {
    workspaceId: layoutWorkspaceId,
    ...(layoutId ? { layoutId } : {}),
    panelSpecs,
    mainPanelIds,
    mainAnchorPanelId: anchor,
  };
}

async function readLayoutSpecFile(input: {
  activeRoot: string;
  extensionDir: string;
  manifestPath: string;
  layoutSpecPath: string;
  workspaceId: string;
  warnings: string[];
}) {
  const normalizedRelative = normalizeString(input.layoutSpecPath).replace(/\\/g, '/');
  if (!normalizedRelative) return { layoutSpecPath: undefined, layout: undefined };
  if (path.isAbsolute(normalizedRelative)) {
    input.warnings.push(`Skipping ${input.manifestPath}: layoutSpecPath must be relative.`);
    return { layoutSpecPath: undefined, layout: undefined };
  }

  const resolved = path.resolve(input.extensionDir, normalizedRelative);
  const extensionRoot = path.resolve(input.extensionDir);
  const normalizedRoot = extensionRoot.endsWith(path.sep) ? extensionRoot : `${extensionRoot}${path.sep}`;
  if (!(resolved === extensionRoot || resolved.startsWith(normalizedRoot))) {
    input.warnings.push(`Skipping ${input.manifestPath}: layoutSpecPath resolves outside extension directory.`);
    return { layoutSpecPath: undefined, layout: undefined };
  }

  if (!fs.existsSync(resolved)) {
    input.warnings.push(`Skipping ${input.manifestPath}: layout spec file not found (${normalizedRelative}).`);
    return { layoutSpecPath: undefined, layout: undefined };
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(await fsp.readFile(resolved, 'utf8'));
  } catch (error) {
    const resolvedPath = normalizeManifestPath(input.activeRoot, resolved);
    input.warnings.push(`Skipping ${input.manifestPath}: invalid layout JSON at ${resolvedPath} (${String((error as Error)?.message || error)}).`);
    return { layoutSpecPath: undefined, layout: undefined };
  }

  const layout = normalizeExtensionLayoutSpec(parsed, input.workspaceId);
  if (!layout) {
    input.warnings.push(`Skipping ${input.manifestPath}: layout spec is missing required panel/main definitions.`);
    return { layoutSpecPath: undefined, layout: undefined };
  }
  if (layout.workspaceId !== input.workspaceId) {
    input.warnings.push(`Skipping ${input.manifestPath}: layout workspaceId "${layout.workspaceId}" does not match manifest workspaceId "${input.workspaceId}".`);
    return { layoutSpecPath: undefined, layout: undefined };
  }
  return {
    layoutSpecPath: normalizedRelative,
    layout,
  };
}

export async function parseWorkspaceExtensionManifest(input: {
  activeRoot: string;
  extensionDir: string;
  manifestPath: string;
  body: unknown;
  warnings: string[];
}): Promise<RepoWorkspaceExtension | null> {
  const record = asRecord(input.body) as RepoWorkspaceExtensionManifest;
  const manifestVersion = Number(record.manifestVersion || 0);
  if (manifestVersion !== 1) {
    input.warnings.push(`Skipping ${input.manifestPath}: manifestVersion must be 1.`);
    return null;
  }

  const id = normalizeString(record.id);
  const label = normalizeString(record.label);
  const workspaceId = normalizeString(record.workspaceId);
  if (!id || !label || !workspaceId) {
    input.warnings.push(`Skipping ${input.manifestPath}: id, label, and workspaceId are required.`);
    return null;
  }

  const workspaceKind = parseWorkspaceKind(record.workspaceKind);
  const description = normalizeString(record.description);
  const layoutSpecPath = normalizeString(record.layoutSpecPath);

  const assistant = asRecord(record.assistant);
  const forge = asRecord(assistant.forge);
  const aboutWorkspace = parseAboutWorkspace(forge.aboutWorkspace);
  const tools = parseForgeTools(forge.tools);

  let layout: RepoWorkspaceExtensionLayoutSpec | undefined;
  let resolvedLayoutSpecPath: string | undefined;
  if (layoutSpecPath) {
    const loaded = await readLayoutSpecFile({
      activeRoot: input.activeRoot,
      extensionDir: input.extensionDir,
      manifestPath: input.manifestPath,
      layoutSpecPath,
      workspaceId,
      warnings: input.warnings,
    });
    layout = loaded.layout;
    resolvedLayoutSpecPath = loaded.layoutSpecPath;
  }

  return {
    id,
    label,
    workspaceId,
    workspaceKind,
    manifestPath: input.manifestPath,
    description,
    ...(resolvedLayoutSpecPath ? { layoutSpecPath: resolvedLayoutSpecPath } : {}),
    ...(layout ? { layout } : {}),
    assistant: {
      forge: {
        ...(aboutWorkspace ? { aboutWorkspace } : {}),
        ...(tools.length > 0 ? { tools } : {}),
      },
    },
  };
}

export async function loadWorkspaceExtensionsFromDirectory(input: {
  activeRoot: string;
  extensionsDir: string;
  allowBuiltInOverrides?: boolean;
}) {
  const warnings: string[] = [];
  const activeRoot = path.resolve(input.activeRoot);
  const extensionsDir = path.resolve(input.extensionsDir);

  if (!fs.existsSync(extensionsDir)) {
    return {
      activeRoot,
      extensions: [] as RepoWorkspaceExtension[],
      warnings,
    };
  }

  let directoryEntries: fs.Dirent[] = [];
  try {
    directoryEntries = await fsp.readdir(extensionsDir, { withFileTypes: true });
  } catch (error) {
    warnings.push(`Unable to read extensions directory: ${String((error as Error)?.message || error)}.`);
    return {
      activeRoot,
      extensions: [] as RepoWorkspaceExtension[],
      warnings,
    };
  }

  const workspaceIdSet = new Set<string>();
  const extensions: RepoWorkspaceExtension[] = [];
  const allowOverrides = input.allowBuiltInOverrides !== false;

  for (const dirent of directoryEntries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!dirent.isDirectory()) continue;
    const extensionDir = path.join(extensionsDir, dirent.name);
    const manifestAbsPath = path.join(extensionDir, EXTENSION_MANIFEST_FILE);
    if (!fs.existsSync(manifestAbsPath)) {
      warnings.push(`Skipping ${normalizeManifestPath(activeRoot, extensionDir)}: missing ${EXTENSION_MANIFEST_FILE}.`);
      continue;
    }

    const manifestPath = normalizeManifestPath(activeRoot, manifestAbsPath);
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(await fsp.readFile(manifestAbsPath, 'utf8'));
    } catch (error) {
      warnings.push(`Skipping ${manifestPath}: invalid JSON (${String((error as Error)?.message || error)}).`);
      continue;
    }

    const extension = await parseWorkspaceExtensionManifest({
      activeRoot,
      extensionDir,
      manifestPath,
      body: parsed,
      warnings,
    });
    if (!extension) continue;

    if (
      BUILTIN_WORKSPACE_ID_SET.has(extension.workspaceId)
      && !(allowOverrides && ALLOWED_BUILTIN_WORKSPACE_OVERRIDES.has(extension.workspaceId))
    ) {
      warnings.push(`Skipping ${manifestPath}: workspaceId "${extension.workspaceId}" is reserved by built-in workspaces.`);
      continue;
    }

    if (workspaceIdSet.has(extension.workspaceId)) {
      warnings.push(`Skipping ${manifestPath}: duplicate workspaceId "${extension.workspaceId}".`);
      continue;
    }

    workspaceIdSet.add(extension.workspaceId);
    extensions.push(extension);
  }

  return {
    activeRoot,
    extensions,
    warnings,
  };
}

export async function loadRepoWorkspaceExtensions(input?: { repoRoot?: string }) {
  const activeRoot = path.resolve(input?.repoRoot || resolveActiveProjectRoot());
  const extensionsDir = path.join(activeRoot, EXTENSIONS_RELATIVE_DIR);
  return loadWorkspaceExtensionsFromDirectory({
    activeRoot,
    extensionsDir,
    allowBuiltInOverrides: true,
  });
}
