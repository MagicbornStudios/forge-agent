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
  'rg -n "editorTarget" apps/repo-studio packages/repo-studio --glob "**/*.{ts,tsx,mjs}" --glob "!apps/repo-studio/scripts/migrate-assistant-target.mjs"',
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

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('[guard-workspace-semantics] OK');

