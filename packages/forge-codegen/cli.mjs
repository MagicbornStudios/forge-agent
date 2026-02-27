#!/usr/bin/env node
/**
 * Forge codegen CLI: layout (workspace panels from TSX), settings (defaults from registry),
 * or app-spec (single canonical file: workspaces + layout + settings + pinned panels).
 * Usage: node cli.mjs [layout|settings|app-spec|all] [--config path/to/forge-codegen.config.mjs]
 * Config default: ./forge-codegen.config.mjs from cwd.
 * When appSpecOutputPath is set, use app-spec (or all) to emit one app-spec.generated.ts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { extractLayoutFromWorkspaceFiles } from './lib/extract-layout.mjs';
import { emitLayout } from './lib/emit-layout.mjs';
import { emitAppSpec } from './lib/emit-app-spec.mjs';
import {
  loadRegistryDefaults,
  deepMerge,
  emitSettingsDefaultsTs,
} from './lib/settings.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  let command = 'all';
  let configPath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      configPath = args[i + 1];
      i++;
    } else if (args[i] === 'layout' || args[i] === 'settings' || args[i] === 'app-spec' || args[i] === 'all') {
      command = args[i];
    }
  }
  return { command, configPath };
}

async function loadConfig(configPath, cwd) {
  const resolved = configPath
    ? path.isAbsolute(configPath)
      ? configPath
      : path.join(cwd, configPath)
    : path.join(cwd, 'forge-codegen.config.mjs');
  if (!fs.existsSync(resolved)) {
    throw new Error(`Config not found: ${resolved}`);
  }
  const url = pathToFileURL(resolved).href;
  const mod = await import(url);
  return mod.default ?? mod;
}

function runLayout(config, cwd) {
  const { workspaceFiles, layoutOutputPath, layoutFormat, layoutOptions } = config;
  if (!workspaceFiles || !layoutOutputPath || !layoutFormat) {
    throw new Error('Config must have workspaceFiles, layoutOutputPath, layoutFormat');
  }
  const layouts = extractLayoutFromWorkspaceFiles(workspaceFiles, cwd);
  const ts = emitLayout(layouts, layoutFormat, layoutOptions ?? {});
  const outPath = path.isAbsolute(layoutOutputPath) ? layoutOutputPath : path.join(cwd, layoutOutputPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, ts, 'utf8');
  console.log('Wrote', outPath);
}

async function runSettings(config, cwd) {
  const {
    settingsRegistryPath,
    settingsOutputPath,
    settingsMergeDefaults,
    settingsExportName = 'REPO_SETTINGS_GENERATED_DEFAULTS',
  } = config;
  if (!settingsRegistryPath || !settingsOutputPath) {
    throw new Error('Config must have settingsRegistryPath, settingsOutputPath');
  }
  const fromRegistry = await loadRegistryDefaults(settingsRegistryPath, cwd);
  const merged = settingsMergeDefaults ? deepMerge(settingsMergeDefaults, fromRegistry) : fromRegistry;
  const ts = emitSettingsDefaultsTs(merged, settingsExportName);
  const outPath = path.isAbsolute(settingsOutputPath)
    ? settingsOutputPath
    : path.join(cwd, settingsOutputPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, ts, 'utf8');
  console.log('Wrote', outPath);
}

async function runAppSpec(config, cwd) {
  const {
    workspaceFiles,
    extensionWorkspaceFiles = [],
    appSpecOutputPath,
    appId,
    appLabel,
    layoutIdPrefix,
    extensionLayoutIdPrefix,
    panelKeyFormat,
    panelKeyPrefix,
    extensionPanelKeyFormat,
    extensionPanelKeyPrefix,
    fallbackWorkspaceId,
    pinnedPanelIds,
    extraPanels,
    settingsRegistryPath,
    settingsMergeDefaults,
    settingsExportName = 'SETTINGS_DEFAULTS',
    sharedTypesImport,
  } = config;
  if (!workspaceFiles || !appSpecOutputPath) {
    throw new Error('Config must have workspaceFiles and appSpecOutputPath for app-spec');
  }
  const layouts = extractLayoutFromWorkspaceFiles(workspaceFiles, cwd);
  const extensionLayouts = extractLayoutFromWorkspaceFiles(extensionWorkspaceFiles, cwd);
  let settings = {};
  if (settingsRegistryPath) {
    const fromRegistry = await loadRegistryDefaults(settingsRegistryPath, cwd);
    settings = settingsMergeDefaults ? deepMerge(settingsMergeDefaults, fromRegistry) : fromRegistry;
  } else if (settingsMergeDefaults) {
    settings = settingsMergeDefaults;
  }
  const layoutOptions = config.layoutOptions ?? {};
  const ts = emitAppSpec(layouts, settings, {
    appId: config.appId ?? layoutOptions.appId,
    appLabel: config.appLabel ?? layoutOptions.appLabel,
    layoutIdPrefix: layoutIdPrefix ?? layoutOptions.layoutIdPrefix ?? 'repo',
    extensionLayoutIdPrefix: extensionLayoutIdPrefix ?? layoutOptions.extensionLayoutIdPrefix,
    panelKeyFormat: panelKeyFormat ?? layoutOptions.panelKeyFormat,
    panelKeyPrefix: panelKeyPrefix ?? layoutOptions.panelKeyPrefix,
    extensionPanelKeyFormat: extensionPanelKeyFormat ?? layoutOptions.extensionPanelKeyFormat,
    extensionPanelKeyPrefix: extensionPanelKeyPrefix ?? layoutOptions.extensionPanelKeyPrefix,
    fallbackWorkspaceId: fallbackWorkspaceId ?? layoutOptions.fallbackWorkspaceId ?? layouts[0]?.workspaceId,
    pinnedPanelIds: pinnedPanelIds ?? [],
    extraPanels: extraPanels ?? layoutOptions.extraPanels ?? {},
    extensionLayouts,
    settingsExportName,
    sharedTypesImport: sharedTypesImport ?? '@forge/shared',
  });
  const outPath = path.isAbsolute(appSpecOutputPath) ? appSpecOutputPath : path.join(cwd, appSpecOutputPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, ts, 'utf8');
  console.log('Wrote', outPath);
}

async function main() {
  const cwd = process.cwd();
  const { command, configPath } = parseArgs();
  const config = await loadConfig(configPath, cwd);

  if (config.appSpecOutputPath && (command === 'app-spec' || command === 'all')) {
    await runAppSpec(config, cwd);
    if (command === 'all') return;
  }

  if (command === 'layout' || command === 'all') {
    if (config.layoutOutputPath) {
      runLayout(config, cwd);
    }
  }
  if (command === 'settings' || command === 'all') {
    if (config.settingsRegistryPath && config.settingsOutputPath) {
      await runSettings(config, cwd);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
