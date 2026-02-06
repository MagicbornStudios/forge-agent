/**
 * Fix frontmatter: remove \\r before title and normalize line endings.
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
  let raw = fs.readFileSync(file, 'utf-8');
  const fixed = raw.replace(/\rtitle:/g, '\ntitle:').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (fixed !== raw) {
    fs.writeFileSync(file, fixed);
    console.log('Fixed', path.relative(docsDir, file));
  }
}
