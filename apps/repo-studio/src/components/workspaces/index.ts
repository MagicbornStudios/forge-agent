import type { ComponentType } from 'react';
import type { RepoWorkspaceId } from '@/lib/types';
import { CodeWorkspace } from './CodeWorkspace';
import { DatabaseWorkspace } from './DatabaseWorkspace';
import { ExtensionsWorkspace } from './ExtensionsWorkspace';
import { GitWorkspace } from './GitWorkspace';
import { PlanningWorkspace } from './PlanningWorkspace';
import type { RepoWorkspaceProps } from './types';
import {
  EnvExtensionWorkspaceAdapter,
  GenericExtensionWorkspaceAdapter,
  StoryExtensionWorkspaceAdapter,
} from '@forge/repo-studio-extension-adapters';

export type { RepoWorkspaceProps, RepoStudioPanelContext } from './types';

export const BUILTIN_REPO_WORKSPACE_COMPONENTS: Record<RepoWorkspaceId, ComponentType<RepoWorkspaceProps>> = {
  planning: PlanningWorkspace,
  extensions: ExtensionsWorkspace,
  database: DatabaseWorkspace,
  git: GitWorkspace,
  code: CodeWorkspace,
};

export const EXTENSION_WORKSPACE_COMPONENTS: Record<string, ComponentType<RepoWorkspaceProps>> = {
  story: StoryExtensionWorkspaceAdapter,
  env: EnvExtensionWorkspaceAdapter,
  generic: GenericExtensionWorkspaceAdapter,
};
