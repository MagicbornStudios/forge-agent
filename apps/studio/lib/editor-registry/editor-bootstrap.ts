'use client';

import { useEditorRegistryStore } from './editor-registry';
import { DialogueEditor, editorDescriptor as dialogueDescriptor } from '@/components/editors/DialogueEditor';
import { CharacterEditor, editorDescriptor as characterDescriptor } from '@/components/editors/CharacterEditor';

/** Register default editors at module load so the registry is populated before first paint. */
export function registerDefaultEditors(): void {
  const { registerEditor } = useEditorRegistryStore.getState();
  registerEditor({ ...dialogueDescriptor, component: DialogueEditor });
  registerEditor({ ...characterDescriptor, component: CharacterEditor });
}
