/**
 * Workspace capabilities contract (headless). Chat/orchestrator uses these;
 * workspaces implement them. No imperative UI refs—stable, testable, domain-controlled.
 */

import type { Selection } from './selection';
import type { ModalRoute } from './modal';
import type { NavRequest } from './navigation';

/** Optional viewport API that editors can expose for revealSelection (e.g. fitView, setCenter). Forge implements via React Flow. */
export interface EditorViewportHandle {
  fitView?: (options?: { padding?: number; nodes?: { id: string }[] }) => boolean;
  setCenter?: (x: number, y: number, options?: { zoom?: number }) => void;
}

export interface WorkspaceContextSnapshot {
  workspaceId: string;
  selection: Selection | null;
  openDocumentId?: string | null;
  openTemplateId?: string | null;
  /** Minimal surrounding info for LLM (node title, character name, selected text excerpt). */
  context?: Record<string, unknown>;
}

export interface WorkspaceCapabilities {
  getSelection(): Selection | null;
  getContextSnapshot(): WorkspaceContextSnapshot;
  navigateTo(target: NavRequest): void;
  openModal(route: ModalRoute): void;
  closeModal(key: string): void;
  applyProposal?(proposalId: string): void;
  rejectProposal?(proposalId: string): void;
  revealSelection?(): void;
}
