/**
 * Content Formatter - extracts set commands
 */
export function extractSetCommands(content: string): string[] {
  if (!content) return [];
  const setCommandRegex = /<<set\s+\$(\w+)\s*([+\-*/=]+)\s*(.+?)>>/g;
  const matches: string[] = [];
  let match;
  while ((match = setCommandRegex.exec(content)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}

export function removeSetCommands(content: string): string {
  const commands = extractSetCommands(content);
  let cleaned = content;
  commands.forEach((cmd) => {
    cleaned = cleaned.replace(cmd, '').trim();
  });
  return cleaned;
}
