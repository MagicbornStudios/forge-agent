import { parsePlanningMarkdown, parsePlanningPlanDoc } from '../../../../../packages/repo-studio/src/core/parsers/planning.mjs';
import type { PlanningStructuredDoc, PlanningStructuredModelResponse } from '@/lib/api/types';
import { loadRepoStudioSnapshot, type PlanningDocEntry, type PlanningSnapshot, type RepoStudioSnapshot } from '@/lib/repo-data';
import { resolveRepoRoot } from '@/lib/repo-files';

function toStructuredDoc(doc: PlanningDocEntry): PlanningStructuredDoc {
  const parsed = parsePlanningMarkdown(doc.content);
  const isPlanDoc = /-PLAN\.md$/i.test(doc.filePath);
  const planModel = isPlanDoc ? parsePlanningPlanDoc(doc.content) : null;

  return {
    id: doc.id,
    title: doc.title,
    filePath: doc.filePath,
    category: doc.category,
    frontmatter: parsed.frontmatter,
    sections: parsed.sections,
    checklists: parsed.checklists,
    warnings: parsed.warnings,
    planModel: planModel
      ? {
        phase: planModel.phase,
        plan: planModel.plan,
        wave: planModel.wave,
        dependsOn: planModel.dependsOn,
        filesModified: planModel.filesModified,
        mustHaves: planModel.mustHaves,
        warnings: planModel.warnings,
      }
      : null,
  };
}

function buildAggregate(docs: PlanningStructuredDoc[]) {
  const checklist = docs.reduce((acc, doc) => ({
    total: acc.total + Number(doc.checklists?.total || 0),
    open: acc.open + Number(doc.checklists?.open || 0),
    closed: acc.closed + Number(doc.checklists?.closed || 0),
  }), { total: 0, open: 0, closed: 0 });

  const warningCount = docs.reduce((acc, doc) => (
    acc
    + (doc.warnings?.length || 0)
    + (doc.planModel?.warnings?.length || 0)
  ), 0);

  return {
    docCount: docs.length,
    planDocCount: docs.filter((doc) => Boolean(doc.planModel)).length,
    checklist,
    warningCount,
  };
}

export function buildPlanningStructuredModelFromSnapshot(snapshot: PlanningSnapshot): PlanningStructuredModelResponse {
  const docs = snapshot.docs.map(toStructuredDoc);
  return {
    ok: true,
    loopId: snapshot.loopId,
    planningRoot: snapshot.planningRoot,
    docs,
    aggregate: buildAggregate(docs),
  };
}

export function buildPlanningStructuredModel(payload: RepoStudioSnapshot): PlanningStructuredModelResponse {
  return buildPlanningStructuredModelFromSnapshot(payload.planning);
}

export async function loadPlanningStructuredModel(loopId?: string): Promise<PlanningStructuredModelResponse> {
  const repoRoot = resolveRepoRoot();
  const snapshot = await loadRepoStudioSnapshot(repoRoot, { loopId });
  return buildPlanningStructuredModel(snapshot);
}
