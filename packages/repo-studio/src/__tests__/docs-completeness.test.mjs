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
  '02-command-policy.md',
  '03-headless-env-flow.md',
  '04-forge-loop-console.md',
  '05-assistant.md',
];

test('repo-studio runbooks are present for package consumers', () => {
  for (const name of REQUIRED_DOCS) {
    const fullPath = path.join(DOCS_DIR, name);
    assert.equal(fs.existsSync(fullPath), true, `missing docs/${name}`);
  }
});
