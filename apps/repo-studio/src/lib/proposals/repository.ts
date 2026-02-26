import {
  type RepoProposal,
  type RepoProposalStatus,
  type RepoProposalTransitionResult,
  type RepoProposalUpsertInput,
} from './contracts';
import {
  findSqliteProposalByApprovalToken,
  findSqliteProposalById,
  isSqliteProposalStoreAvailable,
  listSqliteProposals,
  transitionSqliteProposal,
  upsertSqlitePendingProposal,
} from './payload-repository';

type RepositoryState = {
  initialized: boolean;
  sqliteAvailable: boolean;
  unavailableReason: string;
};

const state: RepositoryState = {
  initialized: false,
  sqliteAvailable: false,
  unavailableReason: '',
};

let initPromise: Promise<void> | null = null;

export class ProposalStoreUnavailableError extends Error {
  readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ProposalStoreUnavailableError';
    this.statusCode = 503;
  }
}

export function isProposalStoreUnavailableError(error: unknown): error is ProposalStoreUnavailableError {
  return error instanceof ProposalStoreUnavailableError;
}

function unavailableMessage() {
  const suffix = state.unavailableReason ? ` (${state.unavailableReason})` : '';
  return `SQLite proposal store unavailable${suffix}.`;
}

async function initializeRepository() {
  if (state.initialized) return;
  const availability = await isSqliteProposalStoreAvailable();
  state.sqliteAvailable = availability.ok;
  state.unavailableReason = availability.ok
    ? ''
    : String(availability.message || 'SQLite proposal store unavailable.');
  state.initialized = true;
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

async function ensureSqliteAvailable() {
  await ensureInitialized();
  if (state.sqliteAvailable) return;
  throw new ProposalStoreUnavailableError(unavailableMessage());
}

async function withSqlite<T>(operation: () => Promise<T>, fallbackMessage: string): Promise<T> {
  await ensureSqliteAvailable();
  try {
    return await operation();
  } catch (error: any) {
    state.sqliteAvailable = false;
    state.unavailableReason = String(error?.message || error || fallbackMessage);
    throw new ProposalStoreUnavailableError(unavailableMessage());
  }
}

export async function listProposalsFromRepository() {
  return withSqlite(
    () => listSqliteProposals(),
    'Unable to list SQLite proposals.',
  );
}

export async function findProposalByIdFromRepository(proposalId: string) {
  return withSqlite(
    () => findSqliteProposalById(proposalId),
    'Unable to read SQLite proposal by id.',
  );
}

export async function findProposalByApprovalTokenFromRepository(approvalToken: string) {
  return withSqlite(
    () => findSqliteProposalByApprovalToken(approvalToken),
    'Unable to read SQLite proposal by approval token.',
  );
}

export async function upsertPendingProposalInRepository(input: RepoProposalUpsertInput): Promise<RepoProposal> {
  return withSqlite(
    () => upsertSqlitePendingProposal(input),
    'Unable to upsert SQLite proposal.',
  );
}

export async function transitionProposalInRepository(
  proposalId: string,
  status: RepoProposalStatus,
  errorText?: string,
): Promise<RepoProposalTransitionResult> {
  return withSqlite(
    () => transitionSqliteProposal(proposalId, status, errorText),
    'Unable to transition SQLite proposal.',
  );
}

export async function isReadOnlyProposalFallback() {
  await ensureInitialized();
  return !state.sqliteAvailable;
}
