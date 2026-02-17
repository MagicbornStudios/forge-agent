export type PlanningHeadingSection = {
  level: number;
  title: string;
  slug: string;
  line: number;
  content: string;
};

export type PlanningChecklistSummary = {
  total: number;
  open: number;
  closed: number;
};

export type PlanningMarkdownParseResult = {
  frontmatter: Record<string, unknown>;
  sections: {
    objective: string;
    context: string;
    tasks: string;
    headings: PlanningHeadingSection[];
  };
  checklists: PlanningChecklistSummary;
  warnings: string[];
};

export type PlanningPlanParseResult = {
  phase: string;
  plan: string;
  wave: number;
  dependsOn: string[];
  filesModified: string[];
  mustHaves: {
    truths: string[];
    artifacts: Array<Record<string, unknown>>;
    keyLinks: Array<Record<string, unknown>>;
  };
  frontmatter: Record<string, unknown>;
  checklists: PlanningChecklistSummary;
  sections: PlanningMarkdownParseResult['sections'];
  warnings: string[];
};

export function parsePlanningMarkdown(input: string): PlanningMarkdownParseResult;
export function parsePlanningPlanDoc(input: string): PlanningPlanParseResult;
