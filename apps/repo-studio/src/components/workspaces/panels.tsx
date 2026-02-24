'use client';

import * as React from 'react';
import {
  BookOpen,
  Bot,
  Database,
  GitCompareArrows,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { LoopCadencePanel } from '@/components/features/planning/LoopCadencePanel';
import { PlanningPanel } from '@/components/features/planning/PlanningPanel';
import { EnvPanel } from '@/components/features/env/EnvPanel';
import { CommandsPanel } from '@/components/features/commands/CommandsPanel';
import { TerminalPanel } from '@/components/features/commands/TerminalPanel';
import { DocsPanel } from '@/components/features/docs/DocsPanel';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import { DiffPanel } from '@/components/features/diff/DiffPanel';
import { CodePanel } from '@/components/features/code/CodePanel';
import { StoryPanel } from '@/components/features/story/StoryPanel';
import { GitPanel } from '@/components/features/git/GitPanel';
import { ReviewQueuePanel } from '@/components/features/review-queue/ReviewQueuePanel';
import { DatabasePanel } from '@/components/features/database/DatabasePanel';
import type { RepoStudioPanelContext } from './types';

export function renderLoopCadenceDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="loop-cadence" title="Loop Cadence" icon={<ShieldCheck size={14} />}>
      <LoopCadencePanel
        nextAction={context.planningSnapshot.nextAction}
        onCopyText={context.onCopyText}
        onRefresh={context.onRefreshLoopSnapshot}
      />
    </WorkspaceLayout.Panel>
  );
}

export function renderPlanningDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="planning" title="Planning" icon={<BookOpen size={14} />}>
      <PlanningPanel
        planning={context.planningSnapshot}
        loops={context.loopEntries}
        activeLoopId={context.activeLoopId}
        switchingLoop={context.switchingLoop}
        selectedDocId={context.selectedDocId}
        onSelectDoc={context.onSelectDoc}
        onSwitchLoop={context.onSwitchLoop}
        onCopyMentionToken={context.onCopyMentionToken}
        onCopyText={context.onCopyText}
        onOpenAssistant={context.onOpenAssistant}
        selectedDocContent={context.selectedDocContent}
      />
    </WorkspaceLayout.Panel>
  );
}

export function renderEnvDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="env" title="Env" icon={<ShieldCheck size={14} />}>
      <EnvPanel
        profile={context.profile}
        mode={context.mode}
        onProfileChange={context.onProfileChange}
        onModeChange={context.onModeChange}
        envOutput={context.envOutput}
        envDoctorPayload={context.envDoctorPayload}
        dependencyHealth={context.dependencyHealth}
        runtimeDeps={context.runtimeDeps}
        onRunDoctor={context.onRunEnvDoctor}
        onRunReconcile={context.onRunEnvReconcile}
        onRefreshDeps={context.onRefreshDeps}
        onCopyText={context.onCopyText}
      />
    </WorkspaceLayout.Panel>
  );
}

export function renderCommandsDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="commands" title="Commands" icon={<Wrench size={14} />}>
      <CommandsPanel
        commandView={context.commandView}
        commandSources={context.commandSources}
        filteredCommands={context.filteredCommands}
        onSetView={context.onSetCommandView}
        onRunCommand={context.onRunCommand}
        onToggleCommand={context.onToggleCommand}
        onCopyText={context.onCopyText}
      />
    </WorkspaceLayout.Panel>
  );
}

export function renderStoryDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="story" title="Story" icon={<BookOpen size={14} />}>
      <StoryPanel
        activeLoopId={context.activeLoopId}
        onCopyText={context.onCopyText}
      />
    </WorkspaceLayout.Panel>
  );
}

export function renderLoopAssistantDockPanel() {
  return (
    <WorkspaceLayout.Panel id="loop-assistant" title="Loop Assistant" icon={<Bot size={14} />}>
      <AssistantPanel title="Loop Assistant" editorTarget="loop-assistant" />
    </WorkspaceLayout.Panel>
  );
}

export function renderCodexAssistantDockPanel() {
  return (
    <WorkspaceLayout.Panel id="codex-assistant" title="Codex Assistant" icon={<Bot size={14} />}>
      <AssistantPanel title="Codex Assistant" editorTarget="codex-assistant" />
    </WorkspaceLayout.Panel>
  );
}

export function renderDocsDockPanel() {
  return (
    <WorkspaceLayout.Panel id="docs" title="Docs" icon={<BookOpen size={14} />}>
      <DocsPanel />
    </WorkspaceLayout.Panel>
  );
}

export function renderTerminalDockPanel() {
  return (
    <WorkspaceLayout.Panel id="terminal" title="Terminal" icon={<TerminalSquare size={14} />}>
      <TerminalPanel />
    </WorkspaceLayout.Panel>
  );
}

export function renderDiffDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="diff" title="Diff" icon={<GitCompareArrows size={14} />}>
      <DiffPanel onCopyText={context.onCopyText} />
    </WorkspaceLayout.Panel>
  );
}

export function renderGitDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="git" title="Git" icon={<GitCompareArrows size={14} />}>
      <GitPanel onCopyText={context.onCopyText} />
    </WorkspaceLayout.Panel>
  );
}

export function renderCodeDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="code" title="Code" icon={<TerminalSquare size={14} />}>
      <CodePanel
        activeLoopId={context.activeLoopId}
        onCopyText={context.onCopyText}
      />
    </WorkspaceLayout.Panel>
  );
}

export function renderReviewQueueDockPanel(context: RepoStudioPanelContext) {
  return (
    <WorkspaceLayout.Panel id="review-queue" title="Review Queue" icon={<ShieldCheck size={14} />}>
      <ReviewQueuePanel
        activeLoopId={context.activeLoopId}
        onCopyText={context.onCopyText}
      />
    </WorkspaceLayout.Panel>
  );
}

export function renderDatabaseDockPanel() {
  return (
    <WorkspaceLayout.Panel id="database" title="Database" icon={<Database size={14} />}>
      <DatabasePanel />
    </WorkspaceLayout.Panel>
  );
}
