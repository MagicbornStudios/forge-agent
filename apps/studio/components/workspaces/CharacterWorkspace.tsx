'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Workspace shell
import {
  WorkspaceShell,
  WorkspaceHeader,
  WorkspaceToolbar,
  WorkspaceLayoutGrid,
  WorkspaceStatusBar,
  WorkspaceOverlaySurface,
} from '@forge/shared/components/workspace';
import type { OverlaySpec, ActiveOverlay, Selection } from '@forge/shared/workspace';
import { isEntity } from '@forge/shared/workspace';

// Copilot
import { useAIHighlight } from '@forge/shared/copilot/use-ai-highlight';
import { useDomainCopilot } from '@forge/shared/copilot/use-domain-copilot';
import { useCharacterContract } from '@forge/domain-character/copilot';

// AppShell
import { useAppShellStore } from '@/lib/app-shell/store';
import { WORKSPACE_EDITOR_IDS } from '@/lib/app-shell/workspace-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';

// Data hooks
import {
  useCharacters,
  useCreateCharacter,
  useUpdateCharacter,
  useDeleteCharacter,
  useRelationships,
  useCreateRelationship,
  useDeleteRelationship,
} from '@/lib/data/hooks';

// Store
import { useCharacterStore } from '@/lib/domains/character/store';

// Components
import { RelationshipGraphEditor, type CharacterViewportHandle } from '@/components/character/RelationshipGraphEditor';
import { ActiveCharacterPanel } from '@/components/character/ActiveCharacterPanel';
import { CharacterSidebar } from '@/components/character/CharacterSidebar';
import { CreateCharacterModal } from '@/components/character/CreateCharacterModal';
import { ModelSwitcher } from '@/components/model-switcher';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { Badge } from '@forge/ui/badge';
import { Card } from '@forge/ui/card';
import type { CharacterDoc, RelationshipDoc } from '@/lib/domains/character/types';

// ---------------------------------------------------------------------------
// Overlay IDs
// ---------------------------------------------------------------------------
const CREATE_CHARACTER_OVERLAY_ID = 'create-character';

// ---------------------------------------------------------------------------
// Selection helper
// ---------------------------------------------------------------------------
function useCharacterSelection(
  selectedCharacterId: number | null,
  selectedRelationshipId: number | null,
): Selection {
  return useMemo(() => {
    if (selectedCharacterId != null) {
      return { type: 'entity' as const, entityType: 'character.node', id: String(selectedCharacterId) };
    }
    if (selectedRelationshipId != null) {
      return { type: 'entity' as const, entityType: 'character.relationship', id: String(selectedRelationshipId) };
    }
    return { type: 'none' as const };
  }, [selectedCharacterId, selectedRelationshipId]);
}

// ---------------------------------------------------------------------------
// CharacterWorkspace
// ---------------------------------------------------------------------------
export function CharacterWorkspace() {
  const editorId = WORKSPACE_EDITOR_IDS.character;
  const workspaceTheme = useAppShellStore((s) => s.workspaceThemes.character);
  const lastProjectId = useAppShellStore((s) => s.lastCharacterProjectId);
  const setLastProjectId = useAppShellStore((s) => s.setLastCharacterProjectId);

  // Settings
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { workspaceId: 'character', editorId }),
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { workspaceId: 'character' }),
  ) as boolean | undefined;
  const toolsEnabledSetting = useSettingsStore((s) =>
    s.getSettingValue('ai.toolsEnabled', { workspaceId: 'character', editorId }),
  ) as boolean | undefined;
  const entitlements = useEntitlements();
  const toolsEnabled = toolsEnabledSetting !== false && entitlements.has(CAPABILITIES.STUDIO_AI_TOOLS);

  // Character store
  const store = useCharacterStore();
  const {
    projectId,
    characters,
    relationships,
    activeCharacterId,
    setProject,
    setCharacters,
    setRelationships,
    setActiveCharacter,
    addCharacter,
    removeCharacter,
    updateCharacterLocal,
    addRelationship,
    removeRelationship,
  } = store;

  // Auto-set project on mount (use last or default to project 1)
  useEffect(() => {
    if (!projectId && lastProjectId) {
      setProject(lastProjectId);
    } else if (!projectId) {
      // Default: first project
      setProject(1);
      setLastProjectId(1);
    }
  }, [projectId, lastProjectId, setProject, setLastProjectId]);

  // Data fetching
  const { data: fetchedChars } = useCharacters(projectId);
  const { data: fetchedRels } = useRelationships(projectId);

  useEffect(() => {
    if (fetchedChars) setCharacters(fetchedChars as CharacterDoc[]);
  }, [fetchedChars, setCharacters]);

  useEffect(() => {
    if (fetchedRels) setRelationships(fetchedRels as RelationshipDoc[]);
  }, [fetchedRels, setRelationships]);

  // Mutations
  const createCharMutation = useCreateCharacter();
  const updateCharMutation = useUpdateCharacter();
  const deleteCharMutation = useDeleteCharacter();
  const createRelMutation = useCreateRelationship();
  const deleteRelMutation = useDeleteRelationship();

  // Selection state
  const [selectedCharId, setSelectedCharId] = useState<number | null>(null);
  const [selectedRelId, setSelectedRelId] = useState<number | null>(null);
  const charSelection = useCharacterSelection(selectedCharId, selectedRelId);

  // Overlays
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay | null>(null);
  const openOverlay = useCallback((id: string, payload?: Record<string, unknown>) => {
    setActiveOverlay({ id, payload });
  }, []);
  const dismissOverlay = useCallback(() => setActiveOverlay(null), []);

  // AI highlights
  const { onAIHighlight, clearHighlights, isHighlighted } = useAIHighlight();

  // Viewport
  const viewportRef = useRef<CharacterViewportHandle | null>(null);

  // ---- CRUD callbacks (for copilot contract) ----
  const handleCreateCharacter = useCallback(
    async (data: { name: string; description?: string; imageUrl?: string }): Promise<CharacterDoc> => {
      const result = await createCharMutation.mutateAsync({ ...data, project: projectId! });
      addCharacter(result as CharacterDoc);
      setActiveCharacter(result.id);
      return result as CharacterDoc;
    },
    [createCharMutation, projectId, addCharacter, setActiveCharacter],
  );

  const handleUpdateCharacter = useCallback(
    async (id: number, updates: Partial<Pick<CharacterDoc, 'name' | 'description' | 'imageUrl'>>) => {
      await updateCharMutation.mutateAsync({ id, ...updates });
      updateCharacterLocal(id, updates);
    },
    [updateCharMutation, updateCharacterLocal],
  );

  const handleCreateRelationship = useCallback(
    async (data: { source: number; target: number; label: string; description?: string }): Promise<RelationshipDoc> => {
      const result = await createRelMutation.mutateAsync({
        project: projectId!,
        sourceCharacter: data.source,
        targetCharacter: data.target,
        label: data.label,
        description: data.description,
      });
      addRelationship(result as RelationshipDoc);
      return result as RelationshipDoc;
    },
    [createRelMutation, projectId, addRelationship],
  );

  const handleGenerateImage = useCallback(async (prompt: string) => {
    const res = await fetch('/api/image-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Image generation failed');
    return { imageUrl: data.imageUrl };
  }, []);

  const handleDeleteRelationship = useCallback(
    async (id: number) => {
      await deleteRelMutation.mutateAsync(id);
      removeRelationship(id);
    },
    [deleteRelMutation, removeRelationship],
  );

  const handleConnect = useCallback(
    (sourceId: number, targetId: number) => {
      // Prompt for label via simple approach; create with default label
      handleCreateRelationship({
        source: sourceId,
        target: targetId,
        label: 'related to',
      }).catch((err) => {
        toast.error('Failed to create relationship', { description: err.message });
      });
    },
    [handleCreateRelationship],
  );

  // ---- Copilot contract ----
  const contract = useCharacterContract({
    characters,
    relationships,
    activeCharacterId,
    projectId,
    selection: charSelection,
    isDirty: store.isDirty,
    createCharacter: handleCreateCharacter,
    updateCharacter: handleUpdateCharacter,
    createRelationship: handleCreateRelationship,
    generateImage: handleGenerateImage,
    setActiveCharacter,
    onAIHighlight,
    clearAIHighlights: clearHighlights,
  });

  useDomainCopilot(contract, { toolsEnabled });

  // ---- Overlay specs ----
  const overlays = useMemo<OverlaySpec[]>(
    () => [
      {
        id: CREATE_CHARACTER_OVERLAY_ID,
        type: 'modal',
        title: 'Create Character',
        size: 'md',
        render: ({ onDismiss }) => (
          <CreateCharacterModal
            onSubmit={(data) => {
              handleCreateCharacter(data)
                .then(() => onDismiss())
                .catch((err) => toast.error('Failed', { description: err.message }));
            }}
            onClose={onDismiss}
          />
        ),
      },
    ],
    [handleCreateCharacter],
  );

  // ---- Menubar ----
  const fileMenuItems = useMemo(
    () => [
      {
        id: 'new-character',
        label: 'New character',
        onSelect: () => openOverlay(CREATE_CHARACTER_OVERLAY_ID),
      },
    ],
    [openOverlay],
  );
  const viewMenuItems = useMemo(
    () => [
      {
        id: 'fit-view',
        label: 'Fit view',
        onSelect: () => viewportRef.current?.fitView(),
      },
    ],
    [],
  );
  const menubarMenus = useMemo(
    () => [
      { id: 'file', label: 'File', items: fileMenuItems },
      { id: 'view', label: 'View', items: viewMenuItems },
    ],
    [fileMenuItems, viewMenuItems],
  );

  // ---- Render slots ----
  const activeChar = characters.find((c) => c.id === activeCharacterId) ?? null;

  const leftContent = (
    <ActiveCharacterPanel character={activeChar} onUpdate={handleUpdateCharacter} />
  );

  const mainContent =
    characters.length > 0 ? (
      <RelationshipGraphEditor
        ref={viewportRef}
        characters={characters}
        relationships={relationships}
        activeCharacterId={activeCharacterId}
        isHighlighted={isHighlighted}
        onCharacterSelect={(id) => {
          setSelectedCharId(id);
          setSelectedRelId(null);
          if (id != null) setActiveCharacter(id);
          clearHighlights();
        }}
        onRelationshipSelect={(id) => {
          setSelectedRelId(id);
          setSelectedCharId(null);
          clearHighlights();
        }}
        onConnect={handleConnect}
      />
    ) : (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">No Characters Yet</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first character to start building relationships.
          </p>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => openOverlay(CREATE_CHARACTER_OVERLAY_ID)}
          >
            + Create Character
          </button>
        </Card>
      </div>
    );

  const rightContent = (
    <CharacterSidebar
      characters={characters}
      relationships={relationships}
      activeCharacterId={activeCharacterId}
      onSelectCharacter={(id) => {
        setActiveCharacter(id);
        setSelectedCharId(id);
        setSelectedRelId(null);
        clearHighlights();
      }}
      onSelectRelationship={(id) => {
        setSelectedRelId(id);
        setSelectedCharId(null);
      }}
      onDeleteRelationship={handleDeleteRelationship}
      onCreateCharacter={() => openOverlay(CREATE_CHARACTER_OVERLAY_ID)}
    />
  );

  return (
    <WorkspaceShell
      workspaceId="character"
      title="Characters"
      subtitle={activeChar?.name}
      domain="character"
      theme={workspaceTheme}
      className="flex flex-col h-full min-h-0 bg-background"
    >
      <WorkspaceHeader>
        <WorkspaceHeader.Left>
          <h1 className="text-lg font-bold">Characters</h1>
        </WorkspaceHeader.Left>
        <WorkspaceHeader.Center>
          {activeChar && (
            <span className="text-sm text-muted-foreground">{activeChar.name}</span>
          )}
        </WorkspaceHeader.Center>
      </WorkspaceHeader>

      <WorkspaceToolbar>
        <WorkspaceToolbar.Left>
          <WorkspaceToolbar.Group className="gap-2">
            <WorkspaceToolbar.Menubar menus={menubarMenus} />
          </WorkspaceToolbar.Group>
          <span className="text-xs text-muted-foreground">
            {characters.length} character{characters.length !== 1 ? 's' : ''} &middot;{' '}
            {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
          </span>
        </WorkspaceToolbar.Left>
        <WorkspaceToolbar.Right>
          {showAgentName !== false && (
            <Badge variant="secondary" className="text-xs">
              Agent: {agentName ?? 'Default'}
            </Badge>
          )}
          <ModelSwitcher />
          <WorkspaceToolbar.Separator />
          <SettingsMenu workspaceId="character" editorId={editorId} />
          <WorkspaceToolbar.Button
            onClick={() => openOverlay(CREATE_CHARACTER_OVERLAY_ID)}
            variant="outline"
            size="sm"
            tooltip="Add a new character"
          >
            Add Character
          </WorkspaceToolbar.Button>
        </WorkspaceToolbar.Right>
      </WorkspaceToolbar>

      <WorkspaceLayoutGrid
        left={leftContent}
        main={mainContent}
        right={rightContent}
        editor={{ editorId, editorType: 'react-flow' }}
      />

      <WorkspaceStatusBar>
        {characters.length > 0
          ? `${characters.length} character${characters.length !== 1 ? 's' : ''}`
          : 'Ready'}
        {charSelection && isEntity(charSelection) && (
          <span className="ml-2 text-muted-foreground">
            &mdash;{' '}
            {charSelection.entityType === 'character.node' ? 'Character' : 'Relationship'}:{' '}
            {charSelection.id}
          </span>
        )}
      </WorkspaceStatusBar>

      <WorkspaceOverlaySurface
        overlays={overlays}
        activeOverlay={activeOverlay}
        onDismiss={dismissOverlay}
      />
    </WorkspaceShell>
  );
}
