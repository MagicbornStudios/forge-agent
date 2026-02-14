'use client';

import * as React from 'react';
import type { PlanningDocEntry } from '@/lib/repo-data';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';

function buildAssistantContext(attachments: PlanningDocEntry[]) {
  if (attachments.length === 0) return '';
  const blocks = attachments.map((doc) => {
    const clipped = doc.content.length > 8000 ? `${doc.content.slice(0, 8000)}\n\n[truncated]` : doc.content;
    return [
      `### ${doc.filePath}`,
      '',
      '```md',
      clipped,
      '```',
    ].join('\n');
  });

  return [
    '# RepoStudio Attached Planning Context',
    '',
    ...blocks,
  ].join('\n');
}

function findDocById(docs: PlanningDocEntry[], id: string | null) {
  if (!id) return null;
  return docs.find((doc) => doc.id === id) || null;
}

export function usePlanningAttachments(docs: PlanningDocEntry[]) {
  const attachedDocIds = useRepoStudioShellStore((state) => state.attachedPlanningDocIds);
  const setAttachedPlanningDocIds = useRepoStudioShellStore((state) => state.setAttachedPlanningDocIds);
  const attachPlanningDocId = useRepoStudioShellStore((state) => state.attachPlanningDocId);
  const detachPlanningDocId = useRepoStudioShellStore((state) => state.detachPlanningDocId);
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(docs[0]?.id || null);

  React.useEffect(() => {
    if (!selectedDocId && docs[0]?.id) {
      setSelectedDocId(docs[0].id);
      return;
    }
    if (selectedDocId && !docs.some((doc) => doc.id === selectedDocId)) {
      setSelectedDocId(docs[0]?.id || null);
    }
  }, [docs, selectedDocId]);

  const docsMap = React.useMemo(
    () => new Map(docs.map((doc) => [doc.id, doc])),
    [docs],
  );

  const selectedDoc = React.useMemo(
    () => findDocById(docs, selectedDocId),
    [docs, selectedDocId],
  );

  const attachedDocs = React.useMemo(
    () => attachedDocIds.map((id) => docsMap.get(id)).filter((doc): doc is PlanningDocEntry => Boolean(doc)),
    [attachedDocIds, docsMap],
  );

  const assistantContext = React.useMemo(
    () => buildAssistantContext(attachedDocs),
    [attachedDocs],
  );

  return {
    selectedDocId,
    setSelectedDocId,
    selectedDoc,
    attachedDocIds,
    attachedDocs,
    assistantContext,
    attachDoc: attachPlanningDocId,
    detachDoc: detachPlanningDocId,
    clearAttachedDocs: () => setAttachedPlanningDocIds([]),
    attachSelectedDoc: () => {
      if (!selectedDocId) return;
      attachPlanningDocId(selectedDocId);
    },
  };
}

