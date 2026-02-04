import type { DomainContextSnapshot } from '@/shared/copilot/types';
import type { Selection } from '@/shared/workspace/selection';
import { isEntity, isCanvasObject } from '@/shared/workspace/selection';
import type { VideoDoc } from '../types';

export interface VideoContextDeps {
  doc: VideoDoc | null;
  selection: Selection | null;
}

/** Build a CopilotKit-readable context snapshot for the video domain. */
export function buildVideoContext(deps: VideoContextDeps): DomainContextSnapshot {
  const { doc, selection } = deps;

  let selectionSummary: string | null = null;
  if (selection && isEntity(selection)) {
    selectionSummary = `${selection.entityType}: ${selection.id}`;
  } else if (selection && isCanvasObject(selection)) {
    selectionSummary = `${selection.system} object: ${selection.id}`;
  }

  const totalElements = doc?.tracks.reduce((sum, t) => sum + t.elements.length, 0) ?? 0;

  return {
    domain: 'video',
    workspaceId: 'video',
    selection,
    selectionSummary,
    domainState: {
      title: doc?.title ?? null,
      trackCount: doc?.tracks.length ?? 0,
      totalElements,
      sceneOverrideCount: doc?.sceneOverrides.length ?? 0,
      resolution: doc?.resolution ?? null,
      trackSummary: doc?.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        elementCount: t.elements.length,
      })) ?? [],
    },
  };
}
