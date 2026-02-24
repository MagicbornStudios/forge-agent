import type { ComponentType } from 'react';
import type { RepoWorkspaceId } from '@/lib/types';
import { CodeWorkspace } from './CodeWorkspace';
import { CodexAssistantWorkspace } from './CodexAssistantWorkspace';
import { CommandsWorkspace } from './CommandsWorkspace';
import { DatabaseWorkspace } from './DatabaseWorkspace';
import { DiffWorkspace } from './DiffWorkspace';
import { DocsWorkspace } from './DocsWorkspace';
import { EnvWorkspace } from './EnvWorkspace';
import { GitWorkspace } from './GitWorkspace';
import { LoopAssistantWorkspace } from './LoopAssistantWorkspace';
import { PlanningWorkspace } from './PlanningWorkspace';
import { ReviewQueueWorkspace } from './ReviewQueueWorkspace';
import { StoryWorkspace } from './StoryWorkspace';
import type { RepoWorkspaceProps } from './types';

export type { RepoWorkspaceProps, RepoStudioPanelContext } from './types';

export const REPO_WORKSPACE_COMPONENTS: Record<RepoWorkspaceId, ComponentType<RepoWorkspaceProps>> = {
  planning: PlanningWorkspace,
  env: EnvWorkspace,
  commands: CommandsWorkspace,
  story: StoryWorkspace,
  docs: DocsWorkspace,
  database: DatabaseWorkspace,
  git: GitWorkspace,
  'loop-assistant': LoopAssistantWorkspace,
  'codex-assistant': CodexAssistantWorkspace,
  diff: DiffWorkspace,
  code: CodeWorkspace,
  'review-queue': ReviewQueueWorkspace,
};

