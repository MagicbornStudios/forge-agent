import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import * as contractsModule from '../../src/lib/proposals/contracts.ts';
import * as legacyStoreModule from '../../src/lib/proposals/json-legacy-store.ts';

const sanitizeProposal = contractsModule.sanitizeProposal || contractsModule.default?.sanitizeProposal;
const compareByDateDesc = contractsModule.compareByDateDesc || contractsModule.default?.compareByDateDesc;
const transitionMessage = contractsModule.transitionMessage || contractsModule.default?.transitionMessage;

const listLegacyProposals = legacyStoreModule.listLegacyProposals || legacyStoreModule.default?.listLegacyProposals;
const findLegacyProposalByApprovalToken = (
  legacyStoreModule.findLegacyProposalByApprovalToken
  || legacyStoreModule.default?.findLegacyProposalByApprovalToken
);

const repoRoot = path.resolve(process.cwd(), '..', '..');
const proposalsPath = path.join(repoRoot, '.repo-studio', 'proposals.json');

let originalStore = null;

test.before(async () => {
  try {
    originalStore = await fs.readFile(proposalsPath, 'utf8');
  } catch {
    originalStore = null;
  }
});

test.after(async () => {
  if (typeof originalStore === 'string') {
    await fs.mkdir(path.dirname(proposalsPath), { recursive: true });
    await fs.writeFile(proposalsPath, originalStore, 'utf8');
    return;
  }
  await fs.rm(proposalsPath, { force: true });
});

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

test('legacy proposal store is readable and approval-token lookup is stable', async () => {
  assert.equal(typeof listLegacyProposals, 'function');
  assert.equal(typeof findLegacyProposalByApprovalToken, 'function');

  const legacyStore = {
    version: 1,
    proposals: [
      {
        id: 'legacy-proposal-1',
        assistantTarget: 'codex-assistant',
        loopId: 'default',
        domain: 'story',
        scopeRoots: ['content/story'],
        scopeOverrideToken: '',
        threadId: 'thread-1',
        turnId: 'turn-1',
        kind: 'test-kind',
        summary: 'Legacy proposal',
        files: ['content/story/act-01/chapter-01/page-001.md'],
        diff: 'diff --git a/a b/b',
        status: 'pending',
        createdAt: '2026-02-17T03:00:00.000Z',
        resolvedAt: null,
        approvalToken: 'legacy-token-1',
      },
    ],
  };

  await fs.mkdir(path.dirname(proposalsPath), { recursive: true });
  await fs.writeFile(proposalsPath, `${JSON.stringify(legacyStore, null, 2)}\n`, 'utf8');

  const proposals = await listLegacyProposals();
  assert.equal(proposals.length >= 1, true);
  const byToken = await findLegacyProposalByApprovalToken('legacy-token-1');
  assert.equal(byToken?.id, 'legacy-proposal-1');
  assert.equal(byToken?.status, 'pending');
});


