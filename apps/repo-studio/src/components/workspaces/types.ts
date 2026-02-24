import type { DependencyHealth, EnvDoctorPayload, RepoMode, RuntimeDepsResponse } from '@/lib/api/types';
import type { PlanningSnapshot, RepoCommandEntry, RepoLoopEntry } from '@/lib/repo-data';
import type { RepoCommandView } from '@/lib/types';
import type { CommandRow } from '@/components/hooks/useCommandFilters';

export type RepoCommandSourceOption = Array<'all' | RepoCommandEntry['source']>;

export interface RepoStudioPanelContext {
  planningSnapshot: PlanningSnapshot;
  loopEntries: RepoLoopEntry[];
  activeLoopId: string;
  switchingLoop: boolean;
  selectedDocId: string | null;
  selectedDocContent: string;
  profile: string;
  mode: RepoMode;
  envOutput: string;
  envDoctorPayload: EnvDoctorPayload | null;
  dependencyHealth: DependencyHealth | null;
  runtimeDeps: RuntimeDepsResponse | null;
  commandView: RepoCommandView;
  commandSources: RepoCommandSourceOption;
  filteredCommands: CommandRow[];
  onSelectDoc: (docId: string) => void;
  onSwitchLoop: (loopId: string) => void;
  onCopyMentionToken: () => void;
  onOpenAssistant: () => void;
  onCopyText: (text: string) => void;
  onRefreshLoopSnapshot: () => void;
  onProfileChange: (value: string) => void;
  onModeChange: (value: RepoMode) => void;
  onRunEnvDoctor: () => void;
  onRunEnvReconcile: () => void;
  onRefreshDeps: () => void;
  onSetCommandView: (next: Partial<RepoCommandView>) => void;
  onRunCommand: (commandId: string) => void;
  onToggleCommand: (commandId: string, disabled: boolean) => void;
}

export interface RepoWorkspaceProps {
  layoutId: string;
  layoutJson: string | null;
  onLayoutChange: (json: string) => void;
  clearLayout: () => void;
  hiddenPanelIds: string[];
  onPanelClosed: (panelId: string) => void;
  panelContext: RepoStudioPanelContext;
}

export function createHiddenPanelSet(hiddenPanelIds: string[]) {
  return new Set(
    (hiddenPanelIds || [])
      .map((panelId) => String(panelId || '').trim())
      .filter(Boolean),
  );
}

export function isPanelVisible(hiddenPanels: Set<string>, panelId: string) {
  return !hiddenPanels.has(panelId);
}
