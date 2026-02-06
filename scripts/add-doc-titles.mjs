/**
 * One-off: add title to docs that have frontmatter but no title (for fumadocs-mdx).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..', 'docs');

function allFiles(dir, ext) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...allFiles(full, ext));
    else if (ext.test(e.name)) out.push(full);
  }
  return out;
}

const files = allFiles(docsDir, /\.(md|mdx)$/);
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf-8');
  if (!raw.startsWith('---')) continue;
  const end = raw.indexOf('---', 3);
  if (end === -1) continue;
  const front = raw.slice(0, end + 3);
  if (front.includes('title:')) continue;
  // Take first # heading from body as title
  const body = raw.slice(end + 3);
  const m = body.match(/^#\s+(.+)$/m);
  const title = m ? m[1].trim() : path.basename(file, path.extname(file)).replace(/-/g, ' ');
  // Insert after first newline after "---" (avoid \r\n making "\rtitle:")
  const firstNewline = front.indexOf('\n', 3);
  const insertAt = firstNewline === -1 ? 4 : firstNewline + 1;
  const newFront = front.slice(0, insertAt) + 'title: ' + title + '\n' + front.slice(insertAt);
  fs.writeFileSync(file, (newFront + body).replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
  console.log('Added title to', path.relative(docsDir, file));
}
