import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(THIS_DIR, '..', '..');
const DOCS_DIR = path.join(PACKAGE_ROOT, 'docs');

const REQUIRED_DOCS = [
  '01-quickstart.md',
  '02-manual-loop.md',
  '03-agent-loop.md',
  '04-headless-runbook.md',
  '05-existing-project-onboarding.md',
  '06-legacy-and-bad-loop-migration.md',
  '07-artifact-contracts.md',
  '08-troubleshooting.md',
];

const FORBIDDEN_TERMS = [
  /\bCursor\b/i,
  /\bCodex\b/i,
  /\bClaude Code\b/i,
  /\bAnthropic\b/i,
  /\bOpenRouter SDK\b/i,
];

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

test('required package runbooks exist', () => {
  for (const docName of REQUIRED_DOCS) {
    const fullPath = path.join(DOCS_DIR, docName);
    assert.equal(fs.existsSync(fullPath), true, `missing runbook: docs/${docName}`);
  }
});

test('package.json includes docs and readme in published files', () => {
  const packageJsonPath = path.join(PACKAGE_ROOT, 'package.json');
  const packageJson = JSON.parse(readText(packageJsonPath));
  const files = Array.isArray(packageJson.files) ? packageJson.files : [];

  assert.ok(files.includes('src'), 'package files must include src');
  assert.ok(files.includes('docs'), 'package files must include docs');
  assert.ok(files.includes('README.md'), 'package files must include README.md');
});

test('package docs and generated prompt templates are agent-agnostic', () => {
  const docFiles = REQUIRED_DOCS.map((name) => path.join(DOCS_DIR, name));
  const extraFiles = [
    path.join(PACKAGE_ROOT, 'README.md'),
    path.join(PACKAGE_ROOT, 'src', 'commands', 'discuss-phase.mjs'),
    path.join(PACKAGE_ROOT, 'src', 'commands', 'execute-phase.mjs'),
    path.join(PACKAGE_ROOT, 'src', 'commands', 'migrate-legacy.mjs'),
  ];

  for (const filePath of [...docFiles, ...extraFiles]) {
    const content = readText(filePath);
    for (const forbidden of FORBIDDEN_TERMS) {
      assert.equal(
        forbidden.test(content),
        false,
        `forbidden tool/provider term found in ${path.relative(PACKAGE_ROOT, filePath)}: ${forbidden}`,
      );
    }
  }
});
