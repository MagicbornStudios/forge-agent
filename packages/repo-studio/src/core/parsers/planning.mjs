import YAML from 'yaml';

function normalizeMarkdown(input) {
  return String(input || '').replace(/\r\n/g, '\n');
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractFrontmatter(markdown) {
  const text = normalizeMarkdown(markdown);
  if (!text.startsWith('---\n')) {
    return {
      raw: '',
      body: text,
      warnings: [],
    };
  }

  const end = text.indexOf('\n---\n', 4);
  if (end === -1) {
    return {
      raw: '',
      body: text,
      warnings: ['Frontmatter start marker found without closing marker.'],
    };
  }

  return {
    raw: text.slice(4, end),
    body: text.slice(end + 5),
    warnings: [],
  };
}

function parseYamlFrontmatter(frontmatterRaw) {
  if (!frontmatterRaw.trim()) return { data: {}, warnings: [] };
  const document = YAML.parseDocument(frontmatterRaw);
  const warnings = [
    ...(document.errors || []).map((entry) => String(entry.message || entry)),
    ...(document.warnings || []).map((entry) => String(entry.message || entry)),
  ];
  const data = document.toJSON() || {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      data: {},
      warnings: ['Frontmatter YAML must evaluate to an object.'],
    };
  }
  return { data, warnings };
}

function extractTaggedSection(body, tagName) {
  const regex = new RegExp(`<${tagName}>\\s*([\\s\\S]*?)\\s*</${tagName}>`, 'i');
  const match = regex.exec(body);
  if (!match) return '';
  return String(match[1] || '').trim();
}

function parseHeadingSections(body) {
  const lines = normalizeMarkdown(body).split('\n');
  const headings = [];
  let current = null;
  let buffer = [];

  const flush = () => {
    if (!current) return;
    headings.push({
      ...current,
      content: buffer.join('\n').trim(),
    });
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (match) {
      flush();
      current = {
        level: match[1].length,
        title: String(match[2] || '').trim(),
        slug: slugify(match[2]),
        line: index + 1,
      };
      buffer = [];
      continue;
    }

    if (current) buffer.push(line);
  }

  flush();
  return headings;
}

function extractChecklistCounts(markdown) {
  const text = normalizeMarkdown(markdown);
  const open = (text.match(/^\s*[-*]\s+\[\s\]/gim) || []).length;
  const closed = (text.match(/^\s*[-*]\s+\[[xX]\]/gim) || []).length;
  return {
    total: open + closed,
    open,
    closed,
  };
}

function headingSection(headings, sectionName) {
  const normalized = String(sectionName || '').trim().toLowerCase();
  const found = headings.find((entry) => String(entry.title || '').trim().toLowerCase() === normalized);
  return found ? found.content : '';
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').trim()).filter(Boolean);
  }
  const single = String(value || '').trim();
  return single ? [single] : [];
}

function normalizeMustHaves(mustHaves) {
  const source = mustHaves && typeof mustHaves === 'object' && !Array.isArray(mustHaves)
    ? mustHaves
    : {};
  return {
    truths: toStringArray(source.truths),
    artifacts: Array.isArray(source.artifacts)
      ? source.artifacts.filter((entry) => entry && typeof entry === 'object')
      : [],
    keyLinks: Array.isArray(source.key_links)
      ? source.key_links.filter((entry) => entry && typeof entry === 'object')
      : [],
  };
}

function normalizePlanId(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{1,2}$/.test(text)) return `00-${text.padStart(2, '0')}`;
  return text;
}

export function parsePlanningMarkdown(input) {
  const text = normalizeMarkdown(input);
  const extracted = extractFrontmatter(text);
  const parsedFrontmatter = parseYamlFrontmatter(extracted.raw);
  const headings = parseHeadingSections(extracted.body);

  const objective = extractTaggedSection(extracted.body, 'objective') || headingSection(headings, 'objective');
  const context = extractTaggedSection(extracted.body, 'context') || headingSection(headings, 'context');
  const tasks = extractTaggedSection(extracted.body, 'tasks') || headingSection(headings, 'tasks');

  return {
    frontmatter: parsedFrontmatter.data,
    sections: {
      objective,
      context,
      tasks,
      headings,
    },
    checklists: extractChecklistCounts(text),
    warnings: [...extracted.warnings, ...parsedFrontmatter.warnings],
  };
}

export function parsePlanningPlanDoc(input) {
  const parsed = parsePlanningMarkdown(input);
  const warnings = [...parsed.warnings];
  const frontmatter = parsed.frontmatter || {};

  const phase = String(frontmatter.phase || '').trim();
  const plan = String(frontmatter.plan || '').trim().padStart(2, '0');
  const wave = Number(frontmatter.wave || 0);
  const dependsOn = toStringArray(frontmatter.depends_on).map(normalizePlanId).filter(Boolean);
  const filesModified = toStringArray(frontmatter.files_modified);
  const mustHaves = normalizeMustHaves(frontmatter.must_haves);

  if (!phase) warnings.push('Missing required frontmatter field: phase');
  if (!plan) warnings.push('Missing required frontmatter field: plan');
  if (!Number.isInteger(wave) || wave <= 0) warnings.push('wave must be a positive integer.');
  if (dependsOn.length === 0 && frontmatter.depends_on && !Array.isArray(frontmatter.depends_on)) {
    warnings.push('depends_on should be an array.');
  }
  if (filesModified.length === 0 && frontmatter.files_modified && !Array.isArray(frontmatter.files_modified)) {
    warnings.push('files_modified should be an array.');
  }
  if (mustHaves.truths.length === 0) warnings.push('must_haves.truths should include at least one value.');
  if (mustHaves.artifacts.length === 0) warnings.push('must_haves.artifacts should include at least one value.');
  if (mustHaves.keyLinks.length === 0) warnings.push('must_haves.key_links should include at least one value.');

  return {
    phase,
    plan,
    wave,
    dependsOn,
    filesModified,
    mustHaves,
    frontmatter,
    checklists: parsed.checklists,
    sections: parsed.sections,
    warnings,
  };
}
