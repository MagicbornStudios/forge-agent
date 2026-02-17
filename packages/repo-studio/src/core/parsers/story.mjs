import { createHash } from 'node:crypto';

function normalizeMarkdown(input) {
  return String(input || '').replace(/\r\n/g, '\n');
}

function hashText(input) {
  return createHash('sha1').update(String(input || '')).digest('hex');
}

function createBlock(type, position, payload) {
  const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
  const sourceHash = hashText(`${type}:${position}:${JSON.stringify(normalizedPayload)}`);
  return {
    id: `blk-${String(position).padStart(4, '0')}-${sourceHash.slice(0, 8)}`,
    type,
    position,
    payload: normalizedPayload,
    sourceHash,
  };
}

function paragraphBlock(text, position) {
  return createBlock('paragraph', position, { text: String(text || '').trim() });
}

function headingBlock(level, text, position) {
  return createBlock(`heading_${level}`, position, { text: String(text || '').trim() });
}

function listItemBlock(type, text, position) {
  return createBlock(type, position, { text: String(text || '').trim() });
}

function quoteBlock(text, position) {
  return createBlock('quote', position, { text: String(text || '').trim() });
}

function codeBlock(language, code, position) {
  return createBlock('code', position, {
    language: String(language || '').trim() || 'plaintext',
    code: String(code || ''),
  });
}

function dividerBlock(position) {
  return createBlock('divider', position, {});
}

function isDivider(line) {
  return /^(\*\s*\*\s*\*|-{3,}|_{3,})$/.test(line.trim());
}

function isHeading(line) {
  return /^(#{1,6})\s+(.+)$/.exec(line);
}

function isBullet(line) {
  return /^[-*+]\s+(.+)$/.exec(line);
}

function isNumbered(line) {
  return /^\d+\.\s+(.+)$/.exec(line);
}

function isQuote(line) {
  return /^>\s?(.*)$/.exec(line);
}

function isCodeFence(line) {
  return /^```(.*)$/.exec(line);
}

export function parseStoryMarkdownToBlocks(input) {
  const markdown = normalizeMarkdown(input);
  const lines = markdown.split('\n');
  const warnings = [];
  const blocks = [];
  let cursor = 0;
  let position = 1;

  while (cursor < lines.length) {
    const line = lines[cursor];
    const trimmed = line.trim();

    if (!trimmed) {
      cursor += 1;
      continue;
    }

    const codeFence = isCodeFence(trimmed);
    if (codeFence) {
      const language = String(codeFence[1] || '').trim();
      const codeLines = [];
      cursor += 1;
      let closed = false;
      while (cursor < lines.length) {
        const bodyLine = lines[cursor];
        if (/^```/.test(bodyLine.trim())) {
          closed = true;
          cursor += 1;
          break;
        }
        codeLines.push(bodyLine);
        cursor += 1;
      }
      if (!closed) warnings.push('Code fence started without closing marker.');
      blocks.push(codeBlock(language, codeLines.join('\n'), position));
      position += 1;
      continue;
    }

    if (isDivider(trimmed)) {
      blocks.push(dividerBlock(position));
      position += 1;
      cursor += 1;
      continue;
    }

    const heading = isHeading(trimmed);
    if (heading) {
      const level = heading[1].length;
      if (level <= 3) {
        blocks.push(headingBlock(level, heading[2], position));
      } else {
        warnings.push(`Heading level ${level} downgraded to paragraph: "${heading[2]}"`);
        blocks.push(paragraphBlock(heading[2], position));
      }
      position += 1;
      cursor += 1;
      continue;
    }

    const bullet = isBullet(trimmed);
    if (bullet) {
      blocks.push(listItemBlock('bulleted_list_item', bullet[1], position));
      position += 1;
      cursor += 1;
      continue;
    }

    const numbered = isNumbered(trimmed);
    if (numbered) {
      blocks.push(listItemBlock('numbered_list_item', numbered[1], position));
      position += 1;
      cursor += 1;
      continue;
    }

    const quote = isQuote(trimmed);
    if (quote) {
      const quoteLines = [quote[1]];
      cursor += 1;
      while (cursor < lines.length) {
        const next = isQuote(lines[cursor].trim());
        if (!next) break;
        quoteLines.push(next[1]);
        cursor += 1;
      }
      blocks.push(quoteBlock(quoteLines.join('\n'), position));
      position += 1;
      continue;
    }

    const paragraphLines = [trimmed];
    cursor += 1;
    while (cursor < lines.length) {
      const next = lines[cursor];
      const nextTrimmed = next.trim();
      if (!nextTrimmed) {
        cursor += 1;
        break;
      }
      if (
        isHeading(nextTrimmed)
        || isBullet(nextTrimmed)
        || isNumbered(nextTrimmed)
        || isQuote(nextTrimmed)
        || isDivider(nextTrimmed)
        || isCodeFence(nextTrimmed)
      ) {
        break;
      }
      paragraphLines.push(nextTrimmed);
      cursor += 1;
    }
    blocks.push(paragraphBlock(paragraphLines.join(' '), position));
    position += 1;
  }

  return {
    blocks,
    contentHash: hashText(markdown),
    warnings,
  };
}
