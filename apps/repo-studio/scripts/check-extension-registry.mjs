#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const hostRoot = path.resolve(appRoot, '..', '..');
const registryRoot = path.join(hostRoot, 'vendor', 'repo-studio-extensions');
const registryExtensionsDir = path.join(registryRoot, 'extensions');
const registryExamplesDir = path.join(registryRoot, 'examples', 'studios');
const REQUIRED_INSTALLABLES = ['story', 'env-workspace'];
const REQUIRED_EXAMPLES = ['character-workspace', 'dialogue-workspace', 'assistant-only'];

if (!fs.existsSync(registryRoot)) {
  console.error('[extensions:registry:health] missing submodule path:', registryRoot);
  process.exit(1);
}

if (!fs.existsSync(registryExtensionsDir)) {
  console.error('[extensions:registry:health] missing extensions directory:', registryExtensionsDir);
  process.exit(1);
}

if (!fs.existsSync(registryExamplesDir)) {
  console.error('[extensions:registry:health] missing examples directory:', registryExamplesDir);
  process.exit(1);
}

const extensionEntries = fs.readdirSync(registryExtensionsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
const extensionIds = new Set(extensionEntries.map((entry) => entry.name));
const missingInstallables = REQUIRED_INSTALLABLES.filter((id) => !extensionIds.has(id));
if (missingInstallables.length > 0) {
  console.error('[extensions:registry:health] missing required installable extensions:', missingInstallables.join(', '));
  process.exit(1);
}

const exampleEntries = fs.readdirSync(registryExamplesDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
const exampleIds = new Set(exampleEntries.map((entry) => entry.name));
const missingExamples = REQUIRED_EXAMPLES.filter((id) => !exampleIds.has(id));
if (missingExamples.length > 0) {
  console.error('[extensions:registry:health] missing required studio examples:', missingExamples.join(', '));
  process.exit(1);
}

for (const exampleId of REQUIRED_EXAMPLES) {
  const metadataPath = path.join(registryExamplesDir, exampleId, 'example.json');
  if (!fs.existsSync(metadataPath)) {
    console.error('[extensions:registry:health] missing example metadata:', metadataPath);
    process.exit(1);
  }
}

console.log(
  `[extensions:registry:health] OK (${extensionEntries.length} installables, ${exampleEntries.length} studio examples)`,
);
