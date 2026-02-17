export type StoryMarkdownBlock = {
  id: string;
  type: string;
  position: number;
  payload: Record<string, unknown>;
  sourceHash: string;
};

export type StoryMarkdownParseResult = {
  blocks: StoryMarkdownBlock[];
  contentHash: string;
  warnings: string[];
};

export function parseStoryMarkdownToBlocks(input: string): StoryMarkdownParseResult;
