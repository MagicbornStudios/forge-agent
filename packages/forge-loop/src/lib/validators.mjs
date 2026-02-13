import { extractFrontmatter } from './markdown.mjs';

const REQUIRED_PLAN_FIELDS = [
  'phase',
  'plan',
  'wave',
  'depends_on',
  'files_modified',
  'autonomous',
  'must_haves',
];

function lineIndent(line) {
  return line.match(/^ */)?.[0].length ?? 0;
}

function stripQuotes(value) {
  const trimmed = String(value || '').trim();
  const doubleQuoted = trimmed.match(/^"(.*)"$/);
  if (doubleQuoted) return doubleQuoted[1];
  const singleQuoted = trimmed.match(/^'(.*)'$/);
  if (singleQuoted) return singleQuoted[1];
  return trimmed;
}

function parseInlineArray(value) {
  const text = String(value || '').trim();
  if (!text.startsWith('[') || !text.endsWith(']')) return null;

  const items = text
    .slice(1, -1)
    .split(',')
    .map((item) => stripQuotes(item))
    .map((item) => item.trim())
    .filter(Boolean);

  return items;
}

function parseScalar(value) {
  const trimmed = String(value || '').trim();
  if (/^(true|false)$/i.test(trimmed)) return /^true$/i.test(trimmed);
  if (/^-?[0-9]+$/.test(trimmed)) return Number(trimmed);
  return stripQuotes(trimmed);
}

function parseListScalar(lines, startIndex, indentSize, errors, sectionName) {
  const values = [];
  let cursor = startIndex;

  while (cursor < lines.length) {
    const line = lines[cursor];
    const trimmed = line.trim();
    const indent = lineIndent(line);

    if (!trimmed) {
      cursor += 1;
      continue;
    }

    if (indent < indentSize) break;
    if (indent !== indentSize || !trimmed.startsWith('- ')) break;

    values.push(parseScalar(trimmed.slice(2)));
    cursor += 1;
  }

  if (values.length === 0) {
    errors.push(`must_haves.${sectionName} must include at least one list item (line ${startIndex + 1}).`);
  }

  return { values, nextIndex: cursor };
}

function parseListObject(lines, startIndex, indentSize, errors, sectionName) {
  const values = [];
  let cursor = startIndex;

  while (cursor < lines.length) {
    const line = lines[cursor];
    const trimmed = line.trim();
    const indent = lineIndent(line);

    if (!trimmed) {
      cursor += 1;
      continue;
    }

    if (indent < indentSize) break;
    if (indent !== indentSize || !trimmed.startsWith('-')) break;

    const current = {};
    const initial = trimmed.replace(/^-/, '').trim();
    if (initial) {
      const inline = initial.match(/^([A-Za-z0-9_.-]+):\s*(.+)$/);
      if (inline) {
        current[inline[1]] = parseScalar(inline[2]);
      } else {
        errors.push(`Invalid ${sectionName} entry syntax near line ${cursor + 1}.`);
      }
    }
    cursor += 1;

    while (cursor < lines.length) {
      const childLine = lines[cursor];
      const childTrim = childLine.trim();
      const childIndent = lineIndent(childLine);

      if (!childTrim) {
        cursor += 1;
        continue;
      }

      if (childIndent < indentSize + 2) break;
      if (childIndent === indentSize && childTrim.startsWith('-')) break;

      const kvMatch = childTrim.match(/^([A-Za-z0-9_.-]+):\s*(.+)$/);
      if (childIndent === indentSize + 2 && kvMatch) {
        current[kvMatch[1]] = parseScalar(kvMatch[2]);
        cursor += 1;
        continue;
      }

      break;
    }

    values.push(current);
  }

  if (values.length === 0) {
    errors.push(`must_haves.${sectionName} must include at least one list item (line ${startIndex + 1}).`);
  }

  return { values, nextIndex: cursor };
}

export function parsePlanFrontmatterYaml(planMarkdown) {
  const { frontmatter } = extractFrontmatter(planMarkdown);
  const errors = [];

  if (!frontmatter) {
    return {
      ok: false,
      data: {},
      errors: ['Missing YAML frontmatter block.'],
      frontmatter: '',
    };
  }

  const lines = frontmatter.split('\n');
  const data = {};

  let cursor = 0;
  while (cursor < lines.length) {
    const line = lines[cursor];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      cursor += 1;
      continue;
    }

    if (lineIndent(line) !== 0) {
      errors.push(`Unexpected indentation at line ${cursor + 1}.`);
      cursor += 1;
      continue;
    }

    const keyMatch = trimmed.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
    if (!keyMatch) {
      errors.push(`Invalid frontmatter line ${cursor + 1}: ${trimmed}`);
      cursor += 1;
      continue;
    }

    const [, key, rawValue] = keyMatch;
    if (key === 'must_haves') {
      if (rawValue.trim()) {
        errors.push(`must_haves must be a nested object (line ${cursor + 1}).`);
        cursor += 1;
        continue;
      }

      const mustHaves = { truths: [], artifacts: [], key_links: [] };
      cursor += 1;
      while (cursor < lines.length) {
        const innerLine = lines[cursor];
        const innerTrim = innerLine.trim();
        const innerIndent = lineIndent(innerLine);

        if (!innerTrim) {
          cursor += 1;
          continue;
        }

        if (innerIndent === 0) break;
        if (innerIndent !== 2) {
          errors.push(`must_haves child keys require 2-space indentation (line ${cursor + 1}).`);
          cursor += 1;
          continue;
        }

        const sectionMatch = innerTrim.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
        if (!sectionMatch) {
          errors.push(`Invalid must_haves section at line ${cursor + 1}: ${innerTrim}`);
          cursor += 1;
          continue;
        }

        const [, section, sectionValue] = sectionMatch;
        if (sectionValue.trim()) {
          errors.push(`must_haves.${section} must be expressed as block list (line ${cursor + 1}).`);
          cursor += 1;
          continue;
        }

        if (section === 'truths') {
          const parsed = parseListScalar(lines, cursor + 1, 4, errors, 'truths');
          mustHaves.truths = parsed.values;
          cursor = parsed.nextIndex;
          continue;
        }

        if (section === 'artifacts') {
          const parsed = parseListObject(lines, cursor + 1, 4, errors, 'artifacts');
          mustHaves.artifacts = parsed.values;
          cursor = parsed.nextIndex;
          continue;
        }

        if (section === 'key_links') {
          const parsed = parseListObject(lines, cursor + 1, 4, errors, 'key_links');
          mustHaves.key_links = parsed.values;
          cursor = parsed.nextIndex;
          continue;
        }

        errors.push(`Unknown must_haves section "${section}" (line ${cursor + 1}).`);
        cursor += 1;
      }

      data.must_haves = mustHaves;
      continue;
    }

    if ((key === 'depends_on' || key === 'files_modified') && rawValue.trim().startsWith('[')) {
      const list = parseInlineArray(rawValue);
      if (!list) {
        errors.push(`Invalid inline array for ${key} at line ${cursor + 1}.`);
      } else {
        data[key] = list;
      }
      cursor += 1;
      continue;
    }

    data[key] = parseScalar(rawValue);
    cursor += 1;
  }

  return {
    ok: errors.length === 0,
    data,
    errors,
    frontmatter,
  };
}

function validateMustHavesShape(mustHaves, errors) {
  if (!mustHaves || typeof mustHaves !== 'object') {
    errors.push('must_haves must be an object with truths, artifacts, and key_links.');
    return;
  }

  if (!Array.isArray(mustHaves.truths) || mustHaves.truths.length === 0) {
    errors.push('must_haves.truths must be a non-empty list.');
  }

  if (!Array.isArray(mustHaves.artifacts) || mustHaves.artifacts.length === 0) {
    errors.push('must_haves.artifacts must be a non-empty list.');
  } else {
    for (const [index, artifact] of mustHaves.artifacts.entries()) {
      if (!artifact || typeof artifact !== 'object') {
        errors.push(`must_haves.artifacts[${index}] must be an object.`);
        continue;
      }
      if (!artifact.path) errors.push(`must_haves.artifacts[${index}].path is required.`);
      if (!artifact.provides) errors.push(`must_haves.artifacts[${index}].provides is required.`);
    }
  }

  if (!Array.isArray(mustHaves.key_links) || mustHaves.key_links.length === 0) {
    errors.push('must_haves.key_links must be a non-empty list.');
  } else {
    for (const [index, link] of mustHaves.key_links.entries()) {
      if (!link || typeof link !== 'object') {
        errors.push(`must_haves.key_links[${index}] must be an object.`);
        continue;
      }
      if (!link.from) errors.push(`must_haves.key_links[${index}].from is required.`);
      if (!link.to) errors.push(`must_haves.key_links[${index}].to is required.`);
      if (!link.via) errors.push(`must_haves.key_links[${index}].via is required.`);
    }
  }
}

export function validatePlanFrontmatter(planMarkdown) {
  const parsed = parsePlanFrontmatterYaml(planMarkdown);
  const errors = [...parsed.errors];
  const data = parsed.data || {};

  for (const field of REQUIRED_PLAN_FIELDS) {
    if (typeof data[field] === 'undefined') {
      errors.push(`Missing required frontmatter field: ${field}`);
    }
  }

  if (typeof data.wave !== 'number' || !Number.isInteger(data.wave) || data.wave <= 0) {
    errors.push('wave must be a positive integer.');
  }

  if (!Array.isArray(data.depends_on)) {
    errors.push('depends_on must be an array.');
  }

  if (!Array.isArray(data.files_modified)) {
    errors.push('files_modified must be an array.');
  }

  if (typeof data.autonomous !== 'boolean') {
    errors.push('autonomous must be a boolean.');
  }

  validateMustHavesShape(data.must_haves, errors);

  return {
    valid: errors.length === 0,
    errors,
    parsed: data,
  };
}

export function validateWaveOrdering(plans) {
  const issues = [];
  const byId = new Map();

  for (const plan of plans) {
    if (!plan || !plan.id) {
      issues.push('Plan id is required.');
      continue;
    }
    byId.set(plan.id, plan);
  }

  const ordered = [...plans].sort((a, b) => Number(a.wave || 0) - Number(b.wave || 0));
  let previousWave = 0;
  for (const plan of ordered) {
    const wave = Number(plan.wave || 0);
    if (!Number.isInteger(wave) || wave <= 0) {
      issues.push(`Plan ${plan.id || 'unknown'} has invalid wave: ${plan.wave}`);
      continue;
    }
    if (wave < previousWave) {
      issues.push(`Plan ${plan.id || 'unknown'} has wave ${wave} out of order (previous ${previousWave}).`);
    }
    previousWave = Math.max(previousWave, wave);
  }

  for (const plan of plans) {
    const deps = Array.isArray(plan.dependsOn) ? plan.dependsOn : [];
    for (const depId of deps) {
      if (!byId.has(depId)) {
        issues.push(`Plan ${plan.id} depends on missing plan ${depId}.`);
        continue;
      }
      const depWave = Number(byId.get(depId).wave || 0);
      const wave = Number(plan.wave || 0);
      if (depWave > wave) {
        issues.push(`Plan ${plan.id} depends on ${depId} in a later wave (${depWave} > ${wave}).`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function parsePlanWave(planMarkdown) {
  const parsed = parsePlanFrontmatterYaml(planMarkdown);
  const wave = Number(parsed.data?.wave || 0);
  return Number.isInteger(wave) ? wave : 0;
}
