import type { ComponentType } from 'react';
import type { RepoWorkspaceId } from '@/lib/types';
import { AssistantWorkspace } from './AssistantWorkspace';
import { CodeWorkspace } from './CodeWorkspace';
import { CommandsWorkspace } from './CommandsWorkspace';
import { DatabaseWorkspace } from './DatabaseWorkspace';
import { DiffWorkspace } from './DiffWorkspace';
import { EnvWorkspace } from './EnvWorkspace';
import { GitWorkspace } from './GitWorkspace';
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
  database: DatabaseWorkspace,
  git: GitWorkspace,
  assistant: AssistantWorkspace,
  diff: DiffWorkspace,
  code: CodeWorkspace,
  'review-queue': ReviewQueueWorkspace,
};
