import { extractSectionsByHeading } from './markdown.mjs';

export function parseStatusSections(statusMarkdown) {
  const sections = extractSectionsByHeading(statusMarkdown, 2);

  return {
    current: sections.get('Current') || '',
    ralphLoop: sections.get('Ralph Wiggum loop') || '',
    next: sections.get('Next') || '',
  };
}

export function parseRalphDoneItems(ralphSection) {
  return String(ralphSection || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^-\s*Done\s*\(/i.test(line))
    .map((line) => line.replace(/^-\s*/, ''));
}

export function parseNextItems(nextSection) {
  const numbered = [];

  for (const line of String(nextSection || '').split('\n')) {
    const trimmed = line.trim();
    const match = trimmed.match(/^\d+\.\s+(.+)$/);
    if (!match) continue;

    let title = match[1].trim();
    let description = '';

    const boldMatch = title.match(/^\*\*(.+?)\*\*\s*[—:-]?\s*(.*)$/);
    if (boldMatch) {
      title = boldMatch[1].trim();
      description = boldMatch[2].trim();
    }

    numbered.push({
      title,
      description,
      raw: trimmed,
    });
  }

  return numbered;
}

export function parseTaskRegistryInitiatives(taskRegistryMarkdown) {
  const lines = String(taskRegistryMarkdown || '').split('\n');
  const items = [];

  let inTable = false;
  for (const line of lines) {
    if (!inTable && /^\|\s*id\s*\|/i.test(line.trim())) {
      inTable = true;
      continue;
    }

    if (!inTable) continue;
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      if (items.length > 0) break;
      continue;
    }
    if (/^\|\s*-+/.test(trimmed)) continue;

    const cells = trimmed
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim());

    if (cells.length < 4) continue;
    const [id, title, impact, status] = cells;
    if (!id || id === 'id') continue;

    items.push({ id, title, impact, status, raw: trimmed });
  }

  return items;
}

export function buildMigrationWarnings(parsed) {
  const warnings = [];

  if (!parsed.status.current) {
    warnings.push({
      code: 'STATUS_CURRENT_MISSING',
      severity: 'warning',
      message: 'STATUS.md section "Current" not found or empty.',
    });
  }

  if (!parsed.status.next) {
    warnings.push({
      code: 'STATUS_NEXT_MISSING',
      severity: 'warning',
      message: 'STATUS.md section "Next" not found or empty.',
    });
  }

  if (parsed.nextItems.length === 0) {
    warnings.push({
      code: 'STATUS_NEXT_ITEMS_EMPTY',
      severity: 'warning',
      message: 'No numbered next items found in STATUS.md Next section.',
    });
  }

  if (parsed.initiatives.length === 0) {
    warnings.push({
      code: 'TASK_REGISTRY_TABLE_EMPTY',
      severity: 'warning',
      message: 'No initiatives parsed from task-registry.md table.',
    });
  }

  return warnings;
}
