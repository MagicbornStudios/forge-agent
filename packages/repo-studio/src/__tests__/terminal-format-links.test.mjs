import assert from 'node:assert/strict';
import test from 'node:test';

import {
  shouldUseTerminalLinks,
  renderTerminalLink,
} from '../lib/terminal-format.mjs';

test('terminal links are emitted only when enabled and supported', () => {
  assert.equal(
    shouldUseTerminalLinks({ tty: true, noLinks: false }),
    true,
  );
  assert.equal(
    shouldUseTerminalLinks({ tty: true, noLinks: true }),
    false,
  );
  assert.equal(
    shouldUseTerminalLinks({ tty: true, plain: true }),
    false,
  );
  assert.equal(
    shouldUseTerminalLinks({ tty: true, asJson: true }),
    false,
  );
});

test('terminal links are suppressed when NO_COLOR is set', () => {
  const original = process.env.NO_COLOR;
  process.env.NO_COLOR = '1';
  try {
    assert.equal(
      shouldUseTerminalLinks({ tty: true }),
      false,
    );
  } finally {
    if (original == null) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = original;
  }
});

test('renderTerminalLink outputs OSC8 sequence only for safe urls and enabled mode', () => {
  const linked = renderTerminalLink('open', 'http://localhost:3010', { enabled: true });
  assert.match(linked, /\u001b\]8;;http:\/\/localhost:3010\u0007open\u001b\]8;;\u0007/);

  const disabled = renderTerminalLink('open', 'http://localhost:3010', { enabled: false });
  assert.equal(disabled, 'open');

  const unsafe = renderTerminalLink('open', 'javascript:alert(1)', { enabled: true });
  assert.equal(unsafe, 'open');
});
