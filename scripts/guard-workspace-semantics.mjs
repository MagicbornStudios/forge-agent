#!/usr/bin/env node

import { execSync } from 'node:child_process';

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
];

for (const check of LEGACY_HARD_CUT_CHECKS) {
  const matches = run(
    `rg -n --glob "**/*.{ts,tsx,mjs,js}" --glob "!scripts/guard-workspace-semantics.mjs" --glob "!**/legacy/**" --glob "!**/archive/**" --glob "!docs/legacy/**" --glob "!apps/docs/content/archive/**" -- "${check.pattern}" apps packages scripts`,
  );
  if (matches) {
    fail(check.message, matches);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('[guard-workspace-semantics] OK');
