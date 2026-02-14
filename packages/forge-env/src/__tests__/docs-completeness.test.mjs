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
  '02-existing-project-onboarding.md',
  '03-headless-gate.md',
  '04-custom-profile.md',
  '05-troubleshooting.md',
];

test('forge-env runbooks are present for package consumers', () => {
  for (const name of REQUIRED_DOCS) {
    const fullPath = path.join(DOCS_DIR, name);
    assert.equal(fs.existsSync(fullPath), true, `missing docs/${name}`);
  }
});

test('package.json publishes docs and readme', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));
  const files = Array.isArray(packageJson.files) ? packageJson.files : [];
  assert.ok(files.includes('src'));
  assert.ok(files.includes('docs'));
  assert.ok(files.includes('README.md'));
});
