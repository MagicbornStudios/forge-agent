'use client';

import { useWorkspaceRegistryStore } from './workspace-registry';
import { DialogueWorkspace, workspaceDescriptor as dialogueDescriptor } from '@/components/workspaces/DialogueWorkspace';
import { CharacterWorkspace, workspaceDescriptor as characterDescriptor } from '@/components/workspaces/CharacterWorkspace';

/** Register default workspaces at module load so the registry is populated before first paint. */
export function registerDefaultWorkspaces(): void {
  const { registerWorkspace } = useWorkspaceRegistryStore.getState();
  registerWorkspace({ ...dialogueDescriptor, component: DialogueWorkspace });
  registerWorkspace({ ...characterDescriptor, component: CharacterWorkspace });
}
