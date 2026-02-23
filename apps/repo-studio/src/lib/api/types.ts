export type RepoMode = 'local' | 'preview' | 'production' | 'headless';
export type RepoScope = 'workspace' | 'loop';
export type RepoCommandSource = 'root-scripts' | 'workspace-scripts' | 'forge-builtins';
export type RepoEnvScope = 'root' | 'app' | 'package' | 'vendor';

export type RepoCommandPolicyEntry = {
  id: string;
  source: RepoCommandSource;
  packageName: string;
  scriptName: string;
  command: string;
  blocked?: boolean;
  blockedBy?: string | null;
  recommended?: boolean;
};

export type RepoCommandView = {
  query: string;
  source: string;
  status: 'all' | 'allowed' | 'blocked';
  tab: 'recommended' | 'all' | 'blocked';
  sort: 'id' | 'source' | 'command';
};

export type CommandsListResponse = {
  ok: boolean;
  commands: RepoCommandPolicyEntry[];
  disabledCommandIds: string[];
  commandView: RepoCommandView;
};

export type ToggleCommandResponse = {
  ok: boolean;
  commandId: string;
  disabled: boolean;
  disabledCommandIds: string[];
  message?: string;
};

export type CommandViewResponse = {
  ok: boolean;
  commandView: RepoCommandView;
  message?: string;
};

export type RepoRunOutputEntry = {
  ts: string;
  stream: 'stdout' | 'stderr';
  text: string;
};

export type RepoRunPayload = {
  id: string;
  commandId: string;
  command: string;
  status: string;
  code: number | null;
  startedAt: string;
  endedAt: string | null;
  output: RepoRunOutputEntry[];
};

export type StartRunResponse = {
  ok: boolean;
  run: RepoRunPayload;
  streamPath: string;
  stopPath: string;
  message?: string;
};

export type StopRunResponse = {
  ok: boolean;
  message?: string;
  run?: RepoRunPayload | null;
};

export type TerminalSessionStatus = {
  sessionId: string;
  running: boolean;
  pid: number | null;
  cwd: string;
  shell: string;
  degraded?: boolean;
  fallbackReason?: string | null;
  createdAt: string;
  lastActivityAt: string;
  exitCode: number | null;
};

export type TerminalSessionStartResponse = {
  ok: boolean;
  reused?: boolean;
  session?: TerminalSessionStatus;
  message?: string;
};

export type TerminalSessionInputResponse = {
  ok: boolean;
  message?: string;
};

export type TerminalSessionResizeResponse = {
  ok: boolean;
  message?: string;
};

export type TerminalSessionStopResponse = {
  ok: boolean;
  stopped?: boolean;
  message?: string;
  session?: TerminalSessionStatus | null;
};

export type DependencyHealth = {
  dockviewPackageResolved: boolean;
  dockviewCssResolved: boolean;
  sharedStylesResolved: boolean;
  cssPackagesResolved: boolean;
  runtimePackagesResolved: boolean;
  postcssConfigResolved?: boolean;
  tailwindPostcssResolved?: boolean;
  tailwindPipelineResolved?: boolean;
  cssPackageStatus: Array<{
    packageName: string;
    resolved: boolean;
    resolvedPath: string | null;
  }>;
  runtimePackageStatus: Array<{
    packageName: string;
    resolved: boolean;
    resolvedPath: string | null;
  }>;
  messages: string[];
};

export type RuntimeDepsResponse = {
  ok: boolean;
  severity?: 'ok' | 'warn' | 'fail';
  desktopRuntimeReady?: boolean;
  desktopStandaloneReady?: boolean;
  deps: DependencyHealth;
  desktop?: {
    electronInstalled?: boolean;
    nextStandalonePresent?: boolean;
    sqlitePathWritable?: boolean;
    watcherAvailable?: boolean;
    messages?: string[];
  } | null;
  desktopAuth?: RepoAuthStatusResponse | null;
};

export type RuntimeStopResponse = {
  ok: boolean;
  message?: string;
  stdout?: string;
  stderr?: string;
};

export type CodexCliInvocation = {
  command?: string;
  args?: string[];
  source?: 'bundled' | 'configured' | string;
  display?: string;
  bundleMissing?: boolean;
};

export type CodexReadiness = {
  ok?: boolean;
  missing?: string[];
  warnings?: string[];
  cli?: {
    installed?: boolean;
    version?: string | null;
    source?: 'bundled' | 'configured' | string;
    invocation?: CodexCliInvocation | null;
  };
  login?: {
    loggedIn?: boolean;
    authType?: 'chatgpt' | 'other' | 'none' | 'unknown' | string;
  };
};

export type CodexSessionStatusResponse = {
  ok: boolean;
  codex?: {
    appServerReachable?: boolean;
    protocolInitialized?: boolean;
    activeThreadCount?: number;
    activeTurnCount?: number;
    execFallbackEnabled?: boolean;
    threadId?: string | null;
    sessionId?: string | null;
    diagnostics?: string[];
    readiness?: CodexReadiness | null;
    transport?: 'app-server' | 'exec' | string;
  };
  message?: string;
};

export type CodexSessionStartResponse = {
  ok: boolean;
  sessionId?: string | null;
  threadId?: string | null;
  protocolInitialized?: boolean;
  activeThreadCount?: number;
  activeTurnCount?: number;
  reused?: boolean;
  readiness?: CodexReadiness | null;
  message?: string;
};

export type CodexSessionStopResponse = {
  ok: boolean;
  stopped?: boolean;
  message?: string;
};

export type CodexLoginResponse = {
  ok: boolean;
  message?: string;
  authUrl?: string | null;
  readiness?: CodexReadiness | null;
  stdout?: string;
  stderr?: string;
};

export type RepoAuthStatusResponse = {
  ok: boolean;
  connected: boolean;
  baseUrl: string;
  provider: 'keytar' | 'safeStorage' | 'memory' | string;
  lastValidatedAt: string | null;
  capabilities: {
    connect: boolean;
    read: boolean;
    write: boolean;
  };
  message?: string;
  status?: number;
  authType?: 'api_key' | 'session' | string;
  userId?: number | null;
  organizationId?: number | null;
  scopes?: string[];
  serverTime?: string | null;
};

export type RepoLoopEntry = {
  id: string;
  name: string;
  planningRoot: string;
  scope: string[];
  profile: string;
  runner: string;
  active: boolean;
};

export type PlanningPhaseRow = {
  phaseNumber: string;
  phaseName: string;
  status: string;
  plans: number;
  summaries: number;
};

export type PlanningTaskRow = {
  id: string;
  title: string;
  area: string;
  status: string;
};

export type PlanningDocEntry = {
  id: string;
  title: string;
  filePath: string;
  content: string;
  category: 'core' | 'phase';
};

export type PlanningSnapshot = {
  loopId: string;
  planningRoot: string;
  nextAction: string;
  percent: number;
  rows: PlanningPhaseRow[];
  tasks: PlanningTaskRow[];
  summaries: number;
  verifications: number;
  decisionOpen: number;
  errorOpen: number;
  docs: PlanningDocEntry[];
  stateContent: string;
  decisionsContent: string;
  errorsContent: string;
};

export type PlanningHeadingSection = {
  level: number;
  title: string;
  slug: string;
  line?: number;
  content: string;
};

export type PlanningChecklistSummary = {
  total: number;
  open: number;
  closed: number;
};

export type PlanningStructuredDoc = {
  id: string;
  title: string;
  filePath: string;
  category: 'core' | 'phase';
  frontmatter: Record<string, unknown>;
  sections: {
    objective: string;
    context: string;
    tasks: string;
    headings: PlanningHeadingSection[];
  };
  checklists: PlanningChecklistSummary;
  warnings: string[];
  planModel?: {
    phase: string;
    plan: string;
    wave: number;
    dependsOn: string[];
    filesModified: string[];
    mustHaves: {
      truths: string[];
      artifacts: Array<Record<string, unknown>>;
      keyLinks: Array<Record<string, unknown>>;
    };
    warnings: string[];
  } | null;
};

export type PlanningStructuredModelResponse = {
  ok: boolean;
  loopId: string;
  planningRoot: string;
  docs: PlanningStructuredDoc[];
  aggregate: {
    docCount: number;
    planDocCount: number;
    checklist: PlanningChecklistSummary;
    warningCount: number;
  };
  message?: string;
};

export type RepoLoopsSnapshot = {
  indexPath: string;
  activeLoopId: string;
  entries: RepoLoopEntry[];
};

export type LoopSnapshotResponse = {
  ok: boolean;
  planning: PlanningSnapshot;
  loops: RepoLoopsSnapshot;
  message?: string;
};

export type LoopUseResponse = {
  ok: boolean;
  loopId?: string;
  message?: string;
  stderr?: string;
};

export type RepoSettingsSnapshot = {
  ok: boolean;
  app: Record<string, unknown>;
  workspace: Record<string, unknown>;
  local: Record<string, unknown>;
  merged: Record<string, unknown>;
  meta: {
    workspaceId: string;
    loopId: string;
  };
};

export type RepoSettingsUpsertRequest = {
  scope: 'app' | 'workspace' | 'local';
  scopeId?: string;
  workspaceId?: string;
  loopId?: string;
  settings: Record<string, unknown>;
};

export type RepoSettingsUpsertResponse = {
  ok: boolean;
  message?: string;
  snapshot: RepoSettingsSnapshot;
};

export type EnvTargetSummary = {
  targetId: string;
  label?: string;
  dir?: string;
  keys?: number;
  missingCount?: number;
  conflictCount?: number;
};

export type EnvDoctorPayload = {
  ok?: boolean;
  profile?: string;
  mode?: RepoMode;
  missing?: Array<{ targetId?: string; key?: string }>;
  conflicts?: Array<{ targetId?: string; key?: string; values?: string[] }>;
  warnings?: string[];
  runner?: string | null;
  runnerSatisfied?: boolean | null;
  codexCliInstalled?: boolean | null;
  codexLoginChatgpt?: boolean | null;
  targets?: EnvTargetSummary[];
  discovery?: {
    manifestCount?: number;
    discoveredCount?: number;
    mergedCount?: number;
    selectedCount?: number;
    discoveredWithoutManifest?: string[];
  };
};

export type EnvDoctorResponse = {
  ok: boolean;
  report?: string;
  stderr?: string;
  resolvedAttempt?: string | null;
  payload?: EnvDoctorPayload;
  message?: string;
};

export type EnvReconcileResponse = {
  ok: boolean;
  report?: string;
  stdout?: string;
  stderr?: string;
  command?: string;
  resolvedAttempt?: string | null;
  message?: string;
};

export type EnvTargetEntry = {
  key: string;
  value: string;
  provenance: string;
  section?: string;
  description?: string;
  requiredIn?: string[];
  secret?: boolean;
};

export type EnvTargetPayload = {
  ok?: boolean;
  targetId?: string;
  profile?: string;
  mode?: RepoMode;
  scope?: RepoEnvScope;
  entries?: EnvTargetEntry[];
  readiness?: {
    ok?: boolean;
    missing?: string[];
    conflicts?: string[];
    warnings?: string[];
  };
  changed?: string[];
  message?: string;
};

export type StoryPageNode = {
  id: string;
  name: string;
  index: number;
  path: string;
};

export type StoryChapterNode = {
  id: string;
  name: string;
  index: number;
  path: string;
  pages: StoryPageNode[];
};

export type StoryActNode = {
  id: string;
  name: string;
  index: number;
  path: string;
  chapters: StoryChapterNode[];
};

export type StoryTreePayload = {
  ok: boolean;
  roots: string[];
  tree?: {
    acts: StoryActNode[];
    pageCount: number;
  };
  message?: string;
};

export type StoryPagePayload = {
  ok: boolean;
  path: string;
  content: string;
  message?: string;
};

export type StoryReaderPayload = {
  ok: boolean;
  current: StoryPageNode | null;
  prev: StoryPageNode | null;
  next: StoryPageNode | null;
  content: string;
  message?: string;
};

export type StoryMutationPayload = {
  ok: boolean;
  message?: string;
  path?: string;
};

export type StoryPublishPreviewPayload = {
  ok: boolean;
  previewToken?: string;
  path?: string;
  loopId?: string;
  domain?: string;
  pageDraft?: {
    sourcePath: string;
    title: string;
    slug: string;
    metadata: Record<string, unknown>;
  };
  blocksDraft?: Array<{
    id: string;
    type: string;
    position: number;
    payload: Record<string, unknown>;
    sourceHash: string;
  }>;
  contentHash?: string;
  changedSummary?: {
    changed: boolean;
    existingHash: string | null;
    nextHash: string;
    previousBlockCount: number;
    nextBlockCount: number;
  };
  warnings?: string[];
  message?: string;
};

export type StoryPublishQueueResponse = {
  ok: boolean;
  proposalId?: string;
  status?: 'pending' | 'applied' | 'rejected' | 'failed';
  message?: string;
};

export type StoryPublishApplyResponse = {
  ok: boolean;
  status?: 'applied' | 'failed';
  pageId?: string;
  blockCount?: number;
  noop?: boolean;
  proposalId?: string;
  message?: string;
};

export type GitStatusEntry = {
  status: string;
  path: string;
};

export type GitBranchEntry = {
  name: string;
  current: boolean;
};

export type GitLogEntry = {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  subject: string;
};

export type GitStatusResponse = {
  ok: boolean;
  files: GitStatusEntry[];
  message?: string;
  stderr?: string;
  stdout?: string;
};

export type GitBranchesResponse = {
  ok: boolean;
  branches: GitBranchEntry[];
  message?: string;
};

export type GitLogResponse = {
  ok: boolean;
  entries: GitLogEntry[];
  message?: string;
};

export type GitMutationResponse = {
  ok: boolean;
  message?: string;
  stderr?: string;
  stdout?: string;
};

export type FilesTreeResponse = {
  ok: boolean;
  files: string[];
  truncated?: boolean;
  roots?: string[];
  domain?: string | null;
  message?: string;
};

export type FileReadResponse = {
  ok: boolean;
  path: string;
  content: string;
  message?: string;
};

export type FileWriteResponse = {
  ok: boolean;
  path?: string;
  size?: number;
  message?: string;
};

export type DiffStatusEntry = {
  status: string;
  path: string;
};

export type DiffStatusResponse = {
  ok: boolean;
  scope?: string;
  roots?: string[];
  files: DiffStatusEntry[];
  message?: string;
};

export type DiffFilePayload = {
  ok: boolean;
  path: string;
  base: string;
  head: string;
  scope?: string;
  roots?: string[];
  original: string;
  modified: string;
  unifiedDiff: string;
  message?: string;
};

export type Proposal = {
  id: string;
  editorTarget: string;
  loopId: string;
  kind: string;
  summary: string;
  files: string[];
  diff: string;
  metadata?: Record<string, unknown> | null;
  status: 'pending' | 'applied' | 'rejected' | 'failed';
  createdAt: string;
  resolvedAt: string | null;
  approvalToken: string;
};

export type ProposalsPayload = {
  ok: boolean;
  proposals: Proposal[];
  pendingCount: number;
  trustMode?: 'require-approval' | 'auto-approve-all';
  autoApplyEnabled?: boolean;
  lastAutoApplyAt?: string | null;
  message?: string;
};

export type ProposalMutationResponse = {
  ok: boolean;
  message?: string;
  proposal?: Proposal;
};

export type ProposalDiffFileSummary = {
  path: string;
  status: 'added' | 'deleted' | 'modified' | 'unknown';
  additions: number;
  deletions: number;
  hasPatch: boolean;
};

export type ProposalDiffFilesResponse = {
  ok: boolean;
  proposalId: string;
  files: ProposalDiffFileSummary[];
  message?: string;
};

export type ProposalDiffFileResponse = {
  ok: boolean;
  proposalId: string;
  path: string;
  unifiedPatch: string;
  additions: number;
  deletions: number;
  hunkCount: number;
  message?: string;
};

export type RepoSearchMatch = {
  path: string;
  line: number;
  column: number;
  preview: string;
};

export type RepoSearchResponse = {
  ok: boolean;
  query: string;
  regex: boolean;
  scope: RepoScope;
  loopId: string | null;
  roots: string[];
  include: string[];
  exclude: string[];
  matches: RepoSearchMatch[];
  truncated?: boolean;
  message?: string;
};
