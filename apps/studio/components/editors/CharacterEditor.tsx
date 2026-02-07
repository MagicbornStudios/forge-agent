'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// New editor platform components
import {
  EditorShell,
  EditorHeader,
  EditorToolbar,
  EditorStatusBar,
  EditorOverlaySurface,
  DockLayout,
  DockPanel,
} from '@forge/shared/components/editor';
import type { OverlaySpec, ActiveOverlay, Selection } from '@forge/shared';
import { isEntity } from '@forge/shared';
import { Users, SlidersHorizontal } from 'lucide-react';

// Copilot
import { useAIHighlight } from '@forge/shared/copilot/use-ai-highlight';
import { useDomainCopilot } from '@forge/shared/copilot/use-domain-copilot';
import { useCharacterContract } from '@forge/domain-character';

// AppShell
import { useEditorStore } from '@/lib/app-shell/store';
import { EDITOR_VIEWPORT_IDS } from '@/lib/app-shell/editor-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';

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
import { RelationshipGraphEditor, type CharacterViewportHandle } from '@/components/character/RelationshipGraphEditor';
import { ActiveCharacterPanel } from '@/components/character/ActiveCharacterPanel';
import { CharacterSidebar } from '@/components/character/CharacterSidebar';
import { CreateCharacterModal } from '@/components/character/CreateCharacterModal';
import { ModelSwitcher } from '@/components/model-switcher';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { Badge } from '@forge/ui/badge';
import { Card } from '@forge/ui/card';
import type { CharacterDoc, RelationshipDoc } from '@/lib/domains/character/types';
import { NodeDragProvider } from '@/components/graph/useNodeDrag';
import { ProjectSwitcher } from '@/components/ProjectSwitcher';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CREATE_CHARACTER_OVERLAY_ID = 'create-character';
const DEFAULT_VOICE_MODEL_ID = 'eleven_multilingual_v2';

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
  const lastProjectId = useEditorStore((s) => s.lastCharacterProjectId);
  const setLastProjectId = useEditorStore((s) => s.setLastCharacterProjectId);

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
    updateCharacterLocal,
    addRelationship,
    removeRelationship,
  } = store;

  const projectsQuery = useProjects('character');
  const createProjectMutation = useCreateProject();

  // Auto-set project on mount
  useEffect(() => {
    if (projectId != null) return;
    const projects = projectsQuery.data ?? [];
    if (lastProjectId && projects.some((p) => p.id === lastProjectId)) {
      setProject(lastProjectId);
      return;
    }
    if (projects.length > 0) {
      setProject(projects[0].id);
      setLastProjectId(projects[0].id);
    }
  }, [projectId, lastProjectId, projectsQuery.data, setProject, setLastProjectId]);

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
    async (data: { name: string; description?: string; imageUrl?: string; voiceId?: string | null }): Promise<CharacterDoc> => {
      const result = await createCharMutation.mutateAsync({ ...data, project: projectId! });
      addCharacter(result as CharacterDoc);
      setActiveCharacter(result.id);
      return result as CharacterDoc;
    },
    [createCharMutation, projectId, addCharacter, setActiveCharacter],
  );

  const handleUpdateCharacter = useCallback(
    async (id: number, updates: Partial<Pick<CharacterDoc, 'name' | 'description' | 'imageUrl' | 'voiceId'>>) => {
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
    generateSpeech: handleGenerateSpeech,
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

  // ---- Content ----
  const activeChar = characters.find((c) => c.id === activeCharacterId) ?? null;

  const leftPanel =
    showLeftPanel === false ? undefined : (
      <DockPanel panelId="character-navigator" title="Characters" icon={<Users className="size-4 shrink-0" />} scrollable={false}>
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
      </DockPanel>
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

  const rightPanel =
    showRightPanel === false ? undefined : (
      <DockPanel panelId="character-properties" title="Properties" icon={<SlidersHorizontal className="size-4 shrink-0" />} scrollable>
        <ActiveCharacterPanel character={activeChar} onUpdate={handleUpdateCharacter} />
      </DockPanel>
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
        <EditorHeader>
          <EditorHeader.Left>
            <h1 className="text-lg font-bold">Characters</h1>
          </EditorHeader.Left>
          <EditorHeader.Center>
            {activeChar && (
              <span className="text-sm text-muted-foreground">{activeChar.name}</span>
            )}
          </EditorHeader.Center>
        </EditorHeader>

        <EditorToolbar className="bg-sidebar border-b border-sidebar-border">
          <EditorToolbar.Left>
            <EditorToolbar.Group className="gap-2">
              <ProjectSwitcher
                projects={projectsQuery.data ?? []}
                selectedProjectId={projectId}
                onProjectChange={(id) => {
                  setProject(id);
                  setLastProjectId(id);
                }}
                onCreateProject={async ({ name, description }) => {
                  const baseSlug = name
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');
                  const existingSlugs = new Set((projectsQuery.data ?? []).map((p) => p.slug));
                  const rootSlug = baseSlug || `character-${Date.now()}`;
                  let slug = rootSlug;
                  let suffix = 2;
                  while (existingSlugs.has(slug)) {
                    slug = `${rootSlug}-${suffix}`;
                    suffix += 1;
                  }
                  const created = await createProjectMutation.mutateAsync({
                    title: name,
                    slug,
                    description,
                    domain: 'character',
                  });
                  setProject(created.id);
                  setLastProjectId(created.id);
                  return { id: created.id, name: created.title };
                }}
                isLoading={projectsQuery.isLoading}
                error={projectsQuery.error ? 'Failed to load projects' : null}
                variant="compact"
              />
              <EditorToolbar.Menubar menus={menubarMenus} />
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
            <ModelSwitcher />
            <EditorToolbar.Separator />
            <SettingsMenu editorId={editorId} viewportId={viewportId} />
            <EditorToolbar.Button
              onClick={() => openOverlay(CREATE_CHARACTER_OVERLAY_ID)}
              variant="outline"
              size="sm"
              tooltip="Add a new character"
            >
              Add Character
            </EditorToolbar.Button>
          </EditorToolbar.Right>
        </EditorToolbar>

        {/* DockLayout (Dockview): resizable, drag, float, persist */}
        <DockLayout
          left={leftPanel}
          main={mainContent}
          right={rightPanel}
          viewport={{ viewportId, viewportType: 'react-flow' }}
          layoutId="character-mode"
          leftDefaultSize={20}
          rightDefaultSize={25}
        />

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
