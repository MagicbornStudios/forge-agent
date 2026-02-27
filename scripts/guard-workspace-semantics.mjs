#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function run(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }).trim();
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout).trim() : '';
    const stderr = error?.stderr ? String(error.stderr).trim() : '';
    return [stdout, stderr].filter(Boolean).join('\n').trim();
  }
}

function fail(header, details) {
  console.error(`[guard-workspace-semantics] ${header}`);
  if (details) {
    console.error(details);
  }
  process.exitCode = 1;
}

const renderHelperMatches = run(
  'rg -n "render[A-Za-z0-9]*DockPanel|PanelSlot" apps/repo-studio/src/components/workspaces --glob "**/*.{ts,tsx}"',
);
if (renderHelperMatches) {
  fail(
    'Repo Studio workspace files must inline WorkspaceLayout.Panel JSX. Render helpers / *Slot names are forbidden.',
    renderHelperMatches,
  );
}

const editorTargetMatches = run(
  'rg -n "editorTarget" apps/repo-studio packages/repo-studio --glob "**/*.{ts,tsx,mjs}"',
);
if (editorTargetMatches) {
  fail('Repo Studio contracts must use assistantTarget (editorTarget is forbidden).', editorTargetMatches);
}

const deprecatedDockSymbolMatches = run(
  'rg -n "EditorDockLayout|EditorDockPanel" apps packages --glob "**/*.{ts,tsx,mjs}"',
);
if (deprecatedDockSymbolMatches) {
  fail(
    'Deprecated dock symbols detected (EditorDockLayout / EditorDockPanel). Use WorkspaceLayout / WorkspacePanel.',
    deprecatedDockSymbolMatches,
  );
}

const deprecatedWorkspaceImportMatches = run(
  'rg -n "@forge/shared/components/editor" apps packages scripts --glob "**/*.{ts,tsx,mjs,js}" --glob "!scripts/guard-workspace-semantics.mjs" --glob "!**/legacy/**" --glob "!**/archive/**"',
);
if (deprecatedWorkspaceImportMatches) {
  fail(
    'Deprecated import path detected (@forge/shared/components/editor). Use @forge/shared/components/workspace.',
    deprecatedWorkspaceImportMatches,
  );
}

const deprecatedEditorComponentMatches = run(
  'rg -n "\\b(EditorShell|EditorHeader|EditorToolbar|EditorStatusBar|EditorReviewBar|EditorOverlaySurface|EditorSettingsTrigger|EditorButton|EditorTooltip|EditorInspector|EditorSidebar|EditorTabGroup|EditorTab|EditorBottomPanel|EditorMenubar|EditorFileMenu|EditorEditMenu|EditorViewMenu|EditorSettingsMenu|EditorHelpMenu|EditorProjectSelect|EditorRail|EditorPanel|EditorApp|createEditorMenubarMenus)\\b" apps packages scripts --glob "**/*.{ts,tsx,mjs,js}" --glob "!scripts/guard-workspace-semantics.mjs" --glob "!**/legacy/**" --glob "!**/archive/**"',
);
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
  const matches = run(
    `rg -n --glob "**/*.{ts,tsx,mjs,js}" --glob "!scripts/guard-workspace-semantics.mjs" --glob "!**/legacy/**" --glob "!**/archive/**" --glob "!docs/legacy/**" --glob "!apps/docs/content/archive/**" -- "${check.pattern}" apps packages scripts`,
  );
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

const builtinStoryAppSpecMatches = run(
  'rg -n "WORKSPACE_IDS\\s*=\\s*\\[[^\\]]*\"story\"" apps/repo-studio/src/lib/app-spec.generated.ts',
);
if (builtinStoryAppSpecMatches) {
  fail(
    'Story must not remain in generated built-in WORKSPACE_IDS. It is extension-backed.',
    builtinStoryAppSpecMatches,
  );
}

const storyFallbackCatalogMatches = run(
  'rg -n "workspaceKind\\s*===\\s*[\\\'\\\"]story[\\\'\\\"]|panel\\.visible\\.ext\\..*story|repo-ext-story" apps/repo-studio/src/lib/workspace-catalog.ts',
);
if (storyFallbackCatalogMatches) {
  fail(
    'Story-specific catalog fallback is forbidden. Extension layout must come from extension payload or generated extension layout getter.',
    storyFallbackCatalogMatches,
  );
}

const extensionsWorkspaceCodegenMatches = run(
  'rg -n "\\bextensions\\s*:\\s*[\\\'\\\"]ExtensionsWorkspace\\.tsx[\\\'\\\"]" apps/repo-studio/forge-codegen.config.mjs',
);
if (!extensionsWorkspaceCodegenMatches) {
  fail(
    'Extensions workspace must be present in built-in repo-studio codegen workspace map.',
    'apps/repo-studio/forge-codegen.config.mjs',
  );
}

const extensionsWorkspaceGeneratedMatches = run(
  'rg -n "WORKSPACE_IDS\\s*=\\s*\\[[^\\]]*\\\"extensions\\\"" apps/repo-studio/src/lib/app-spec.generated.ts',
);
if (!extensionsWorkspaceGeneratedMatches) {
  fail(
    'Generated built-in WORKSPACE_IDS must include extensions workspace.',
    'apps/repo-studio/src/lib/app-spec.generated.ts',
  );
}

const storyInstallPromptMatches = run(
  'rg -n "showStoryInstallPrompt|extensionRegistryHasStory|Story extension is available from registry but not installed" apps/repo-studio/src/components/RepoStudioRoot.tsx',
);
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

const exampleInstallablePathMatches = run(
  'rg -n "extensions/(assistant-only|character-workspace|dialogue-workspace)" vendor/repo-studio-extensions --glob "**/*"',
);
if (exampleInstallablePathMatches) {
  fail(
    'Studio examples must not be treated as installable extensions under vendor/repo-studio-extensions/extensions.',
    exampleInstallablePathMatches,
  );
}

const loopSwitcherMatches = run(
  'rg -n "Select\\s+value=\\{activeLoopId\\}" apps/repo-studio/src/components/workspaces/PlanningWorkspace.tsx packages/repo-studio-extension-adapters/src/StoryExtensionWorkspaceAdapter.tsx',
);
if (loopSwitcherMatches) {
  fail(
    'Loop switcher Select controls must not remain in Planning/Story toolbars.',
    loopSwitcherMatches,
  );
}

const removedBuiltinWorkspaceMatches = run(
  'rg -n "\\b(env|commands|assistant|diff|review-queue)\\s*:\\s*[\'\\\"][A-Za-z0-9_-]+Workspace\\.tsx[\'\\\"]" apps/repo-studio/forge-codegen.config.mjs',
);
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

const removedWorkspaceFocusMenuMatches = run(
  'rg -n "Focus\\s+(Commands|Diff|Review Queue)|view-focus-(assistant-ws|diff-ws|review-queue|commands)" apps/repo-studio/src/lib/app-shell/menu-contributions.ts',
);
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
