import assert from 'node:assert/strict';
import test from 'node:test';

import * as contractsModule from '../../src/lib/proposals/contracts.ts';

const sanitizeProposal = contractsModule.sanitizeProposal || contractsModule.default?.sanitizeProposal;
const compareByDateDesc = contractsModule.compareByDateDesc || contractsModule.default?.compareByDateDesc;
const transitionMessage = contractsModule.transitionMessage || contractsModule.default?.transitionMessage;

test('proposal contract helpers stay deterministic', () => {
  assert.equal(typeof sanitizeProposal, 'function');
  assert.equal(typeof compareByDateDesc, 'function');
  assert.equal(typeof transitionMessage, 'function');

  const first = sanitizeProposal({
    id: 'a',
    summary: 'A',
    status: 'pending',
    createdAt: '2026-02-17T01:00:00.000Z',
  });
  const second = sanitizeProposal({
    id: 'b',
    summary: 'B',
    status: 'applied',
    createdAt: '2026-02-17T02:00:00.000Z',
  });
  const ordered = [first, second].sort(compareByDateDesc);
  assert.deepEqual(ordered.map((item) => item.id), ['b', 'a']);
  assert.equal(transitionMessage('applied'), 'Proposal applied.');
  assert.equal(transitionMessage('rejected'), 'Proposal rejected.');
  assert.equal(transitionMessage('failed'), 'Proposal marked failed.');
});

test('proposal assistant target contract is forge/codex only', () => {
  const codex = sanitizeProposal({ assistantTarget: 'codex' });
  const forge = sanitizeProposal({ assistantTarget: 'forge' });
  const fallback = sanitizeProposal({ assistantTarget: 'anything-else' });

  assert.equal(codex.assistantTarget, 'codex');
  assert.equal(forge.assistantTarget, 'forge');
  assert.equal(fallback.assistantTarget, 'forge');
});
