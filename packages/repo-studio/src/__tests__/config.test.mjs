import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_REPO_STUDIO_CONFIG } from '../lib/config.mjs';

test('default config includes runtime controls and planning-first views', () => {
  assert.equal(DEFAULT_REPO_STUDIO_CONFIG.runtime.defaultMode, 'auto');
  assert.equal(DEFAULT_REPO_STUDIO_CONFIG.runtime.reuseByDefault, true);
  assert.equal(DEFAULT_REPO_STUDIO_CONFIG.views.defaultView, 'planning');
  assert.equal(DEFAULT_REPO_STUDIO_CONFIG.ui.defaultTheme, 'dark');
  assert.equal(DEFAULT_REPO_STUDIO_CONFIG.ui.defaultDensity, 'compact');
  assert.equal(DEFAULT_REPO_STUDIO_CONFIG.commandPolicy.allowTerminal, true);
  assert.equal(DEFAULT_REPO_STUDIO_CONFIG.commandPolicy.terminalAllowlistedOnly, true);
});
