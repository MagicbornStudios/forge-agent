#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { searchPattern } from './lib/guard-search.mjs';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mjs', '.js'];
const WORKSPACE_EXTENSIONS = ['.ts', '.tsx', '.mjs'];
const SOURCE_EXCLUDES = ['scripts/guard-workspace-semantics.mjs', '/legacy/', '/archive/'];
const SOURCE_EXCLUDES_WITH_DOC_ARCHIVE = [...SOURCE_EXCLUDES, 'docs/legacy/', 'apps/docs/content/archive/'];

function fail(header, details) {
  console.error(`[guard-workspace-semantics] ${header}`);
  if (details) {
    console.error(details);
  }
  process.exitCode = 1;
}

const renderHelperMatches = searchPattern({
  pattern: 'render[A-Za-z0-9]*DockPanel|PanelSlot',
  roots: ['apps/repo-studio/src/components/workspaces'],
  extensions: ['.ts', '.tsx'],
});
if (renderHelperMatches) {
  fail(
    'Repo Studio workspace files must inline WorkspaceLayout.Panel JSX. Render helpers / *Slot names are forbidden.',
    renderHelperMatches,
  );
}

const editorTargetMatches = searchPattern({
  pattern: 'editorTarget',
  roots: ['apps/repo-studio', 'packages/repo-studio'],
  extensions: WORKSPACE_EXTENSIONS,
});
if (editorTargetMatches) {
  fail('Repo Studio contracts must use assistantTarget (editorTarget is forbidden).', editorTargetMatches);
}

const deprecatedDockSymbolMatches = searchPattern({
  pattern: 'EditorDockLayout|EditorDockPanel',
  roots: ['apps', 'packages'],
  extensions: WORKSPACE_EXTENSIONS,
});
if (deprecatedDockSymbolMatches) {
  fail(
    'Deprecated dock symbols detected (EditorDockLayout / EditorDockPanel). Use WorkspaceLayout / WorkspacePanel.',
    deprecatedDockSymbolMatches,
  );
}

const deprecatedWorkspaceImportMatches = searchPattern({
  pattern: '@forge/shared/components/editor',
  roots: ['apps', 'packages', 'scripts'],
  extensions: SOURCE_EXTENSIONS,
  excludeSubpaths: SOURCE_EXCLUDES,
});
if (deprecatedWorkspaceImportMatches) {
  fail(
    'Deprecated import path detected (@forge/shared/components/editor). Use @forge/shared/components/workspace.',
    deprecatedWorkspaceImportMatches,
  );
}

const deprecatedEditorComponentMatches = searchPattern({
  pattern:
    '\\b(EditorShell|EditorHeader|EditorToolbar|EditorStatusBar|EditorReviewBar|EditorOverlaySurface|EditorSettingsTrigger|EditorButton|EditorTooltip|EditorInspector|EditorSidebar|EditorTabGroup|EditorTab|EditorBottomPanel|EditorMenubar|EditorFileMenu|EditorEditMenu|EditorViewMenu|EditorSettingsMenu|EditorHelpMenu|EditorProjectSelect|EditorRail|EditorPanel|EditorApp|createEditorMenubarMenus)\\b',
  roots: ['apps', 'packages', 'scripts'],
  extensions: SOURCE_EXTENSIONS,
  excludeSubpaths: SOURCE_EXCLUDES,
});
if (deprecatedEditorComponentMatches) {
  fail(
    'Deprecated Editor* workspace component symbols detected. Use Workspace* names.',
    deprecatedEditorComponentMatches,
  );
}

const LEGACY_LOOP_TARGET = `loop${'-'}assistant`;
const LEGACY_CODEX_TARGET = `codex${'-'}assistant`;
const LEGACY_PROMPT_KEY = `assistant.prompts.${'loopAssistant'}`;
const LEGACY_DEFAULT_TARGET_KEY = `default${'Editor'}`;
const LEGACY_ROUTE_KEY = `assistant.routes.${'loop'}`;
const LEGACY_JSON_STORE = `json${'-'}legacy${'-'}store`;
const LEGACY_UI_FLAG = `--legacy${'-'}ui`;
const LEGACY_FORGE_FALLBACK = `runLocalForgeAssistant`;
const LEGACY_FORGE_FALLBACK_FILE = `forge${'-'}assistant${'-'}chat`;

const LEGACY_HARD_CUT_CHECKS = [
  {
    pattern: `\\b(${LEGACY_LOOP_TARGET}|${LEGACY_CODEX_TARGET})\\b`,
    message: 'Legacy assistant target ids detected. Use forge/codex.',
  },
  {
    pattern: LEGACY_PROMPT_KEY.replaceAll('.', '\\.'),
    message: 'Legacy assistant prompt key detected. Use assistant.prompts.forgeAssistant.',
  },
  {
    pattern: `\\b${LEGACY_DEFAULT_TARGET_KEY}\\b`,
    message: 'Legacy assistant config key detected. Use defaultTarget.',
  },
  {
    pattern: LEGACY_ROUTE_KEY.replaceAll('.', '\\.'),
    message: 'Legacy assistant route key detected. Use assistant.routes.forge.',
  },
  {
    pattern: LEGACY_JSON_STORE,
    message: 'Legacy JSON proposal fallback detected. SQLite-only storage is required.',
  },
  {
    pattern: LEGACY_UI_FLAG,
    message: 'Legacy CLI fallback flag detected. Legacy package runtime UI fallback is removed.',
  },
  {
    pattern: LEGACY_FORGE_FALLBACK,
    message: 'Legacy local Forge fallback detected. Forge must use OpenRouter/proxy only.',
  },
  {
    pattern: LEGACY_FORGE_FALLBACK_FILE,
    message: 'Legacy forge-assistant-chat fallback module detected.',
  },
];

for (const check of LEGACY_HARD_CUT_CHECKS) {
  const matches = searchPattern({
    pattern: check.pattern,
    roots: ['apps', 'packages', 'scripts'],
    extensions: SOURCE_EXTENSIONS,
    excludeSubpaths: SOURCE_EXCLUDES_WITH_DOC_ARCHIVE,
  });
  if (matches) {
    fail(check.message, matches);
  }
}

const repoStudioCodegenPath = 'apps/repo-studio/forge-codegen.config.mjs';
const repoStudioCodegenSource = fs.existsSync(repoStudioCodegenPath)
  ? fs.readFileSync(repoStudioCodegenPath, 'utf8')
  : '';
const workspaceFileMapMatch = repoStudioCodegenSource.match(/const\s+WORKSPACE_FILE_MAP\s*=\s*\{([\s\S]*?)\};/);
if (workspaceFileMapMatch && /\bstory\s*:/.test(workspaceFileMapMatch[1])) {
  fail(
    'Story must not remain in built-in WORKSPACE_FILE_MAP. Story is extension-backed (extensionWorkspaceFiles only).',
    repoStudioCodegenPath,
  );
}
if (workspaceFileMapMatch && /\benv\s*:/.test(workspaceFileMapMatch[1])) {
  fail(
    'Env must not remain in built-in WORKSPACE_FILE_MAP. Env is extension-backed.',
    repoStudioCodegenPath,
  );
}

const builtinStoryAppSpecMatches = searchPattern({
  pattern: 'WORKSPACE_IDS\\s*=\\s*\\[[^\\]]*"story"',
  roots: ['apps/repo-studio/src/lib/app-spec.generated.ts'],
  extensions: ['.ts'],
});
if (builtinStoryAppSpecMatches) {
  fail(
    'Story must not remain in generated built-in WORKSPACE_IDS. It is extension-backed.',
    builtinStoryAppSpecMatches,
  );
}

const storyFallbackCatalogMatches = searchPattern({
  pattern: String.raw`workspaceKind\s*===\s*['"]story['"]|panel\.visible\.ext\..*story|repo-ext-story`,
  roots: ['apps/repo-studio/src/lib/workspace-catalog.ts'],
  extensions: ['.ts'],
});
if (storyFallbackCatalogMatches) {
  fail(
    'Story-specific catalog fallback is forbidden. Extension layout must come from extension payload or generated extension layout getter.',
    storyFallbackCatalogMatches,
  );
}

const extensionsWorkspaceCodegenMatches = searchPattern({
  pattern: String.raw`\bextensions\s*:\s*['"]ExtensionsWorkspace\.tsx['"]`,
  roots: ['apps/repo-studio/forge-codegen.config.mjs'],
  extensions: ['.mjs'],
});
if (!extensionsWorkspaceCodegenMatches) {
  fail(
    'Extensions workspace must be present in built-in repo-studio codegen workspace map.',
    'apps/repo-studio/forge-codegen.config.mjs',
  );
}

const extensionsWorkspaceGeneratedMatches = searchPattern({
  pattern: 'WORKSPACE_IDS\\s*=\\s*\\[[^\\]]*"extensions"',
  roots: ['apps/repo-studio/src/lib/app-spec.generated.ts'],
  extensions: ['.ts'],
});
if (!extensionsWorkspaceGeneratedMatches) {
  fail(
    'Generated built-in WORKSPACE_IDS must include extensions workspace.',
    'apps/repo-studio/src/lib/app-spec.generated.ts',
  );
}

const storyInstallPromptMatches = searchPattern({
  pattern: 'showStoryInstallPrompt|extensionRegistryHasStory|Story extension is available from registry but not installed',
  roots: ['apps/repo-studio/src/components/RepoStudioRoot.tsx'],
  extensions: ['.tsx'],
});
if (storyInstallPromptMatches) {
  fail(
    'Story-specific install prompt logic in RepoStudioRoot is forbidden. Extensions discovery should be workspace-driven.',
    storyInstallPromptMatches,
  );
}

const registryRequiredPaths = [
  'vendor/repo-studio-extensions/extensions/story',
  'vendor/repo-studio-extensions/extensions/env-workspace',
  'vendor/repo-studio-extensions/examples/studios/character-workspace',
  'vendor/repo-studio-extensions/examples/studios/dialogue-workspace',
  'vendor/repo-studio-extensions/examples/studios/assistant-only',
  'vendor/repo-studio-extensions/examples/studios/character-workspace/example.json',
  'vendor/repo-studio-extensions/examples/studios/dialogue-workspace/example.json',
  'vendor/repo-studio-extensions/examples/studios/assistant-only/example.json',
];
const missingRegistryPaths = registryRequiredPaths.filter((target) => !fs.existsSync(path.resolve(target)));
if (missingRegistryPaths.length > 0) {
  fail(
    'Missing required RepoStudio extension registry paths (installables/examples).',
    missingRegistryPaths.join('\n'),
  );
}

const exampleInstallablePathMatches = searchPattern({
  pattern: 'extensions/(assistant-only|character-workspace|dialogue-workspace)',
  roots: ['vendor/repo-studio-extensions'],
  extensions: ['.json', '.md', '.txt', '.ts', '.tsx', '.js', '.mjs', '.yml', '.yaml'],
});
if (exampleInstallablePathMatches) {
  fail(
    'Studio examples must not be treated as installable extensions under vendor/repo-studio-extensions/extensions.',
    exampleInstallablePathMatches,
  );
}

const loopSwitcherMatches = searchPattern({
  pattern: 'Select\\s+value=\\{activeLoopId\\}',
  roots: [
    'apps/repo-studio/src/components/workspaces/PlanningWorkspace.tsx',
    'packages/repo-studio-extension-adapters/src/StoryExtensionWorkspaceAdapter.tsx',
  ],
  extensions: ['.tsx'],
});
if (loopSwitcherMatches) {
  fail(
    'Loop switcher Select controls must not remain in Planning/Story toolbars.',
    loopSwitcherMatches,
  );
}

const removedBuiltinWorkspaceMatches = searchPattern({
  pattern: String.raw`\b(env|commands|assistant|diff|review-queue)\s*:\s*['"][A-Za-z0-9_-]+Workspace\.tsx['"]`,
  roots: ['apps/repo-studio/forge-codegen.config.mjs'],
  extensions: ['.mjs'],
});
if (removedBuiltinWorkspaceMatches) {
  fail(
    'Removed built-in workspaces detected in repo-studio codegen map. Built-ins must be planning/extensions/database/git/code only.',
    removedBuiltinWorkspaceMatches,
  );
}

const forbiddenAppLocalWorkspaceFiles = [
  'apps/repo-studio/src/components/workspaces/StoryWorkspace.tsx',
  'apps/repo-studio/src/components/workspaces/EnvWorkspace.tsx',
  'apps/repo-studio/src/components/workspaces/GenericExtensionWorkspace.tsx',
];
const forbiddenAppLocalWorkspaceHits = forbiddenAppLocalWorkspaceFiles.filter((target) => fs.existsSync(path.resolve(target)));
if (forbiddenAppLocalWorkspaceHits.length > 0) {
  fail(
    'App-local Story/Env/Generic extension workspace implementations are forbidden. Use @forge/repo-studio-extension-adapters.',
    forbiddenAppLocalWorkspaceHits.join('\n'),
  );
}

const removedWorkspaceFocusMenuMatches = searchPattern({
  pattern: 'Focus\\s+(Commands|Diff|Review Queue)|view-focus-(assistant-ws|diff-ws|review-queue|commands)',
  roots: ['apps/repo-studio/src/lib/app-shell/menu-contributions.ts'],
  extensions: ['.ts'],
});
if (removedWorkspaceFocusMenuMatches) {
  fail(
    'Legacy workspace focus menu items detected for removed standalone workspaces.',
    removedWorkspaceFocusMenuMatches,
  );
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('[guard-workspace-semantics] OK');
