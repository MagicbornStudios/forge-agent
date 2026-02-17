import {
  type RepoProposal,
  type RepoProposalStatus,
  type RepoProposalTransitionResult,
  type RepoProposalUpsertInput,
} from './contracts';
import {
  findLegacyProposalByApprovalToken,
  findLegacyProposalById,
  listLegacyProposals,
  readLegacyProposalStore,
} from './json-legacy-store';
import {
  findSqliteProposalByApprovalToken,
  findSqliteProposalById,
  importLegacyProposalsToSqlite,
  isSqliteProposalStoreAvailable,
  listSqliteProposals,
  transitionSqliteProposal,
  upsertSqlitePendingProposal,
} from './payload-repository';

type RepositoryState = {
  initialized: boolean;
  sqliteAvailable: boolean;
  fallbackReason: string;
};

const state: RepositoryState = {
  initialized: false,
  sqliteAvailable: false,
  fallbackReason: '',
};

let initPromise: Promise<void> | null = null;

async function initializeRepository() {
  if (state.initialized) return;
  const availability = await isSqliteProposalStoreAvailable();
  state.sqliteAvailable = availability.ok;
  state.fallbackReason = availability.message || '';

  if (!availability.ok) {
    state.initialized = true;
    return;
  }

  try {
    const legacyEntries = await readLegacyProposalStore();
    if (legacyEntries.length > 0) {
      await importLegacyProposalsToSqlite(legacyEntries);
    }
  } catch (error: any) {
    state.sqliteAvailable = false;
    state.fallbackReason = String(error?.message || error || 'Unable to migrate legacy proposals.');
  } finally {
    state.initialized = true;
  }
}

async function ensureInitialized() {
  if (state.initialized) return;
  if (!initPromise) {
    initPromise = initializeRepository().finally(() => {
      initPromise = null;
    });
  }
  await initPromise;
}

function readOnlyFallbackMessage() {
  const suffix = state.fallbackReason ? ` (${state.fallbackReason})` : '';
  return `SQLite proposal store unavailable${suffix}. JSON fallback is read-only.`;
}

export async function listProposalsFromRepository() {
  await ensureInitialized();
  if (state.sqliteAvailable) {
    try {
      return await listSqliteProposals();
    } catch (error: any) {
      state.sqliteAvailable = false;
      state.fallbackReason = String(error?.message || error || 'Unable to read SQLite proposals.');
    }
  }
  return listLegacyProposals();
}

export async function findProposalByIdFromRepository(proposalId: string) {
  await ensureInitialized();
  if (state.sqliteAvailable) {
    try {
      return await findSqliteProposalById(proposalId);
    } catch (error: any) {
      state.sqliteAvailable = false;
      state.fallbackReason = String(error?.message || error || 'Unable to read SQLite proposal.');
    }
  }
  return findLegacyProposalById(proposalId);
}

export async function findProposalByApprovalTokenFromRepository(approvalToken: string) {
  await ensureInitialized();
  if (state.sqliteAvailable) {
    try {
      return await findSqliteProposalByApprovalToken(approvalToken);
    } catch (error: any) {
      state.sqliteAvailable = false;
      state.fallbackReason = String(error?.message || error || 'Unable to read SQLite proposal.');
    }
  }
  return findLegacyProposalByApprovalToken(approvalToken);
}

export async function upsertPendingProposalInRepository(input: RepoProposalUpsertInput): Promise<RepoProposal> {
  await ensureInitialized();
  if (!state.sqliteAvailable) {
    throw new Error(readOnlyFallbackMessage());
  }
  return upsertSqlitePendingProposal(input);
}

export async function transitionProposalInRepository(
  proposalId: string,
  status: RepoProposalStatus,
  errorText?: string,
): Promise<RepoProposalTransitionResult> {
  await ensureInitialized();
  if (!state.sqliteAvailable) {
    return {
      ok: false,
      proposal: null,
      message: readOnlyFallbackMessage(),
      noop: false,
    };
  }
  return transitionSqliteProposal(proposalId, status, errorText);
}

export async function isReadOnlyProposalFallback() {
  await ensureInitialized();
  return !state.sqliteAvailable;
}

