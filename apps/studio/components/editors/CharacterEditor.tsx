'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// New editor platform components
import {
  EditorShell,
  EditorToolbar,
  EditorStatusBar,
  EditorOverlaySurface,
  EditorDockPanel,
  EditorDockLayout,
} from '@forge/shared/components/editor';
import type { OverlaySpec, ActiveOverlay, Selection, DockLayoutRef } from '@forge/shared';
import { isEntity } from '@forge/shared';

// Copilot
import { useAIHighlight } from '@forge/shared/assistant';

// AppShell
import { useEditorStore } from '@/lib/app-shell/store';
import { EDITOR_VIEWPORT_IDS } from '@/lib/app-shell/editor-metadata';
import { CHAT_PANEL_ID } from '@/lib/editor-registry/constants';
import { DialogueAssistantPanel } from '@/components/editors/dialogue/DialogueAssistantPanel';
import { ModelSwitcher } from '@/components/model-switcher';
import { useEditorPanelVisibility } from '@/lib/app-shell/useEditorPanelVisibility';
import { useSettingsStore } from '@/lib/settings/store';

// Data hooks
import {
  useCharacters,
  useCreateCharacter,
  useUpdateCharacter,
  useRelationships,
  useCreateRelationship,
  useDeleteRelationship,
  useProjects,
  useCreateProject,
  useGenerateSpeech,
  useGenerateImage,
} from '@/lib/data/hooks';

// Store
import { useCharacterStore } from '@/lib/domains/character/store';

// Components
import { BookOpen, LayoutDashboard, LayoutPanelTop, MessageCircle, PanelLeft, PanelRight, Plus, ScanSearch, Users } from 'lucide-react';
import type { EditorDescriptor } from '@/lib/editor-registry/editor-registry';
import { Button } from '@forge/ui/button';
import { RelationshipGraphEditor, type CharacterViewportHandle } from '@/components/character/RelationshipGraphEditor';
import { ActiveCharacterPanel } from '@/components/character/ActiveCharacterPanel';
import { CharacterSidebar } from '@/components/character/CharacterSidebar';
import { CreateCharacterModal } from '@/components/character/CreateCharacterModal';
import { useAppMenubarContribution } from '@/lib/contexts/AppMenubarContext';
import {
  EditorLayoutProvider,
  EditorMenubarContribution,
  EditorMenubarMenuSlot,
} from '@/components/editor-layout';
import { Badge } from '@forge/ui/badge';
import { Card } from '@forge/ui/card';
import type { CharacterDoc, RelationshipDoc } from '@/lib/domains/character/types';
import { NodeDragProvider } from '@/components/graph/useNodeDrag';

// ---------------------------------------------------------------------------
// Editor descriptor for registry; defaults live on the component.
// ---------------------------------------------------------------------------
export const editorDescriptor: Omit<EditorDescriptor, 'component'> = {
  id: 'character',
  label: 'Characters',
  summary: 'Character relationship graph (React Flow)',
  icon: Users,
  order: 1,
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CREATE_CHARACTER_OVERLAY_ID = 'create-character';
const EDIT_CHARACTER_OVERLAY_ID = 'edit-character';
const DEFAULT_VOICE_MODEL_ID = 'eleven_multilingual_v2';

type CharacterUpsertPayload = {
  name: string;
  description?: string;
  imageUrl?: string;
  voiceId?: string | null;
  meta?: Record<string, unknown>;
};

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
// CharacterEditor — the new-naming migration of CharacterWorkspace
// ---------------------------------------------------------------------------
/**
 * CharacterEditor — AI-first character management editor.
 *
 * Uses the new editor platform components:
 * - `EditorShell` (replaces `WorkspaceShell`)
 * - `EditorHeader` (replaces `WorkspaceHeader`)
 * - `EditorToolbar` (replaces `WorkspaceToolbar`)
 * - `DockLayout` (replaces `WorkspaceLayoutGrid`) — resizable panels!
 * - `DockPanel` (wraps left/right panels with title + scroll)
 * - `EditorStatusBar` (replaces `WorkspaceStatusBar`)
 * - `EditorOverlaySurface` (replaces `WorkspaceOverlaySurface`)
 */
export function CharacterEditor() {
  const editorId = 'character';
  const viewportId = EDITOR_VIEWPORT_IDS.character;
  const activeProjectId = useEditorStore((s) => s.activeProjectId);

  // Settings
  const editorTheme = useSettingsStore((s) =>
    s.getSettingValue('ui.theme', { editorId }),
  ) as string | undefined;
  const editorDensity = useSettingsStore((s) =>
    s.getSettingValue('ui.density', { editorId }),
  ) as string | undefined;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { editorId, viewportId }),
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { editorId }),
  ) as boolean | undefined;
  const toolsEnabledSetting = useSettingsStore((s) =>
    s.getSettingValue('ai.toolsEnabled', { editorId, viewportId }),
  ) as boolean | undefined;
  const showLeftPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.character-left', { editorId, viewportId }),
  ) as boolean | undefined;
  const showRightPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.character-right', { editorId, viewportId }),
  ) as boolean | undefined;
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
    updateCharacterLocal,
    addRelationship,
    removeRelationship,
  } = store;

  // Sync app-level project into character store so this editor uses the shared project context.
  useEffect(() => {
    setProject(activeProjectId);
  }, [activeProjectId, setProject]);

  const setSettingsViewportId = useEditorStore((s) => s.setSettingsViewportId);
  useEffect(() => {
    setSettingsViewportId(viewportId);
    return () => setSettingsViewportId(null);
  }, [viewportId, setSettingsViewportId]);

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
  const createRelMutation = useCreateRelationship();
  const deleteRelMutation = useDeleteRelationship();
  const generateSpeechMutation = useGenerateSpeech();
  const generateImageMutation = useGenerateImage();

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

  // ---- CRUD callbacks ----
  const handleCreateCharacter = useCallback(
    async (data: CharacterUpsertPayload): Promise<CharacterDoc> => {
      const result = await createCharMutation.mutateAsync({ ...data, project: projectId! });
      addCharacter(result as CharacterDoc);
      setActiveCharacter(result.id);
      return result as CharacterDoc;
    },
    [createCharMutation, projectId, addCharacter, setActiveCharacter],
  );

  const handleUpdateCharacter = useCallback(
    async (
      id: number,
      updates: Partial<
        Pick<CharacterDoc, 'name' | 'description' | 'imageUrl' | 'voiceId' | 'meta'>
      >,
    ) => {
      const sanitizedUpdates = {
        ...updates,
        description: updates.description ?? undefined,
        imageUrl: updates.imageUrl ?? undefined,
        meta: updates.meta ?? undefined,
      };
      await updateCharMutation.mutateAsync({ id, ...sanitizedUpdates });
      updateCharacterLocal(id, sanitizedUpdates);
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
    return generateImageMutation.mutateAsync({ prompt });
  }, [generateImageMutation]);

  const handleGenerateSpeech = useCallback(
    async (voiceId: string, text: string) => {
      const result = await generateSpeechMutation.mutateAsync({
        voiceId,
        text,
        modelId: DEFAULT_VOICE_MODEL_ID,
      });
      return { audioUrl: result.audioUrl };
    },
    [generateSpeechMutation],
  );

  const handleDeleteRelationship = useCallback(
    async (id: number) => {
      await deleteRelMutation.mutateAsync(id);
      removeRelationship(id);
    },
    [deleteRelMutation, removeRelationship],
  );

  const handleConnect = useCallback(
    (sourceId: number, targetId: number) => {
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

  const handleDropCreateCharacter = useCallback(() => {
    if (!projectId) return;
    handleCreateCharacter({ name: 'New Character' })
      .then((created) => {
        setSelectedCharId(created.id);
        setSelectedRelId(null);
      })
      .catch((err) => {
        toast.error('Failed to create character', { description: err.message });
      });
  }, [handleCreateCharacter, projectId]);

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
            onCreate={handleCreateCharacter}
            onUpdate={handleUpdateCharacter}
            onClose={onDismiss}
          />
        ),
      },
      {
        id: EDIT_CHARACTER_OVERLAY_ID,
        type: 'modal',
        title: 'Edit Character',
        size: 'lg',
        render: ({ onDismiss, payload }) => {
          const characterId =
            typeof payload?.characterId === 'number'
              ? payload.characterId
              : Number(payload?.characterId);
          const editingCharacter = characters.find((c) => c.id === characterId);
          if (!editingCharacter) {
            return (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Character not found.</p>
                <Button type="button" variant="outline" onClick={onDismiss}>
                  Close
                </Button>
              </div>
            );
          }
          return (
            <CreateCharacterModal
              character={editingCharacter}
              onCreate={handleCreateCharacter}
              onUpdate={handleUpdateCharacter}
              onClose={onDismiss}
            />
          );
        },
      },
    ],
    [characters, handleCreateCharacter, handleUpdateCharacter],
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
  const { visibility: panelVisibility, setVisible: setPanelVisible, restoreAll: restoreAllPanels, panelSpecs } = useEditorPanelVisibility('character');
  const layoutRef = useRef<DockLayoutRef>(null);
  const CHARACTER_LAYOUT_ID = 'character-mode';

  const viewMenuItems = useMemo(
    () => {
      const panelIcons: Record<string, React.ReactNode> = {
        left: <PanelLeft size={16} />,
        right: <PanelRight size={16} />,
      };
      const layoutSubmenu = [
        ...panelSpecs.map((spec) => ({
          id: `panel-${spec.id}`,
          label: panelVisibility[spec.key] === false ? `Show ${spec.label}` : `Hide ${spec.label}`,
          icon: panelIcons[spec.id] ?? <LayoutPanelTop size={16} />,
          onSelect: () => setPanelVisible(spec.key, !(panelVisibility[spec.key] !== false)),
        })),
        { id: 'view-sep-layout', type: 'separator' as const },
        {
          id: 'restore-all-panels',
          label: 'Restore all panels',
          icon: <LayoutPanelTop size={16} />,
          onSelect: () => {
            restoreAllPanels();
            layoutRef.current?.resetLayout();
          },
        },
        {
          id: 'reset-layout',
          label: 'Reset layout',
          icon: <LayoutPanelTop size={16} />,
          onSelect: () => layoutRef.current?.resetLayout(),
        },
      ];
      return [
        {
          id: 'layout',
          label: 'Layout',
          icon: <LayoutPanelTop size={16} />,
          submenu: layoutSubmenu,
        },
      ];
    },
    [panelSpecs, panelVisibility, setPanelVisible, restoreAllPanels],
  );
  const menubarMenus = useMemo(
    () => [
      { id: 'file', label: 'File', items: fileMenuItems },
      { id: 'view', label: 'View', items: viewMenuItems },
    ],
    [fileMenuItems, viewMenuItems],
  );

  // ---- Content ----
  const activeChar = characters.find((c) => c.id === activeCharacterId) ?? null;

  const leftPanel =
    showLeftPanel === false ? undefined : (
      <EditorDockPanel panelId="character-navigator" title="Characters" scrollable={false} hideTitleBar>
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
      </EditorDockPanel>
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
        onDropCreateCharacter={handleDropCreateCharacter}
      />
    ) : (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">No Characters Yet</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first character to start building relationships.
          </p>
          <Button
            type="button"
            variant="link"
            className="text-sm text-primary"
            onClick={() => openOverlay(CREATE_CHARACTER_OVERLAY_ID)}
          >
            <Plus className="mr-1 size-3" />
            Create Character
          </Button>
        </Card>
      </div>
    );

  const rightPanel =
    showRightPanel === false ? undefined : (
      <EditorDockPanel panelId="character-properties" title="Properties" scrollable hideTitleBar>
        <ActiveCharacterPanel
          character={activeChar}
          onUpdate={handleUpdateCharacter}
          onOpenUpsert={(id) => openOverlay(EDIT_CHARACTER_OVERLAY_ID, { characterId: id })}
        />
      </EditorDockPanel>
    );

  return (
    <NodeDragProvider>
      <EditorShell
        editorId="character"
        title="Characters"
        subtitle={activeChar?.name}
        domain="character"
        theme={editorTheme}
        density={editorDensity}
        className="bg-canvas"
      >
        <EditorToolbar className="bg-sidebar border-b border-sidebar-border">
          <EditorToolbar.Left>
            <EditorToolbar.Group className="gap-[var(--control-gap)]">
            </EditorToolbar.Group>
            <span className="text-xs text-muted-foreground">
              {characters.length} character{characters.length !== 1 ? 's' : ''} &middot;{' '}
              {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
            </span>
          </EditorToolbar.Left>
          <EditorToolbar.Right>
          {showAgentName !== false && (
            <Badge variant="secondary" className="text-xs">
              Agent: {agentName ?? 'Default'}
            </Badge>
          )}
          <EditorToolbar.Separator />
          <EditorToolbar.Button
            onClick={() => openOverlay(CREATE_CHARACTER_OVERLAY_ID)}
            variant="outline"
            size="sm"
          >
              Add Character
            </EditorToolbar.Button>
          </EditorToolbar.Right>
        </EditorToolbar>

        <EditorLayoutProvider editorId="character" viewportId={viewportId}>
          <EditorMenubarContribution>
            <EditorMenubarMenuSlot id="file" label="File" items={fileMenuItems} />
            <EditorMenubarMenuSlot id="view" label="View" items={viewMenuItems} />
          </EditorMenubarContribution>
          <EditorDockLayout
            ref={layoutRef}
            layoutId={CHARACTER_LAYOUT_ID}
            viewport={{ viewportId, viewportType: 'react-flow' }}
            slots={{ left: { title: 'Characters' }, main: { title: 'Graph' } }}
            leftDefaultSize={20}
            rightDefaultSize={25}
          >
            <EditorDockLayout.Left>
              <EditorDockLayout.Panel id="left" title="Characters" icon={<BookOpen size={14} />}>
                {leftPanel}
              </EditorDockLayout.Panel>
            </EditorDockLayout.Left>
            <EditorDockLayout.Main>
              <EditorDockLayout.Panel id="main" title="Graph" icon={<LayoutDashboard size={14} />}>
                {mainContent}
              </EditorDockLayout.Panel>
            </EditorDockLayout.Main>
            <EditorDockLayout.Right>
              <EditorDockLayout.Panel id="right" title="Properties" icon={<ScanSearch size={14} />}>
                {rightPanel}
              </EditorDockLayout.Panel>
              <EditorDockLayout.Panel id={CHAT_PANEL_ID} title="Chat" icon={<MessageCircle size={14} />}>
                <div className="h-full min-h-0">
                  <DialogueAssistantPanel
                    composerTrailing={<ModelSwitcher provider="assistantUi" variant="composer" />}
                  />
                </div>
              </EditorDockLayout.Panel>
            </EditorDockLayout.Right>
          </EditorDockLayout>
        </EditorLayoutProvider>

        <EditorStatusBar>
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
        </EditorStatusBar>

        <EditorOverlaySurface
          overlays={overlays}
          activeOverlay={activeOverlay}
          onDismiss={dismissOverlay}
        />
      </EditorShell>
    </NodeDragProvider>
  );
}
