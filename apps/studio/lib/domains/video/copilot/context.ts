import type { DomainContextSnapshot } from '@forge/shared/copilot/types';
import type { Selection } from '@forge/shared/workspace/selection';
import { isEntity, isCanvasObject } from '@forge/shared/workspace/selection';
import { getVideoDocData, type VideoDoc } from '../types';

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

  const data = getVideoDocData(doc);
  const totalElements = data.tracks.reduce((sum, t) => sum + t.elements.length, 0);

  return {
    domain: 'video',
    workspaceId: 'video',
    selection,
    selectionSummary,
    domainState: {
      title: doc?.title ?? null,
      trackCount: data.tracks.length,
      totalElements,
      sceneOverrideCount: data.sceneOverrides.length,
      resolution: data.resolution,
      trackSummary: data.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        elementCount: t.elements.length,
      })),
    },
  };
}
