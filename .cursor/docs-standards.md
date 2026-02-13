# Documentation Standards for Forge Platform

## Code Block Language Tags

### ✅ CORRECT Language Tags

Use these language tags in code fences for proper syntax highlighting:

```markdown
```bash
npm install @forge/dev-kit
```

```shell
pnpm install
pnpm dev
```

```typescript
import { EditorShell } from '@forge/dev-kit';
```

```tsx
export function MyEditor() {
  return <EditorShell />;
}
```

```javascript
const config = { theme: 'dark' };
```

```json
{
  "name": "@forge/dev-kit",
  "version": "1.0.0"
}
```

```yaml
title: Documentation
created: 2026-02-11
```

```css
.editor-shell {
  display: flex;
}
```
```

### ❌ INCORRECT Language Tags

**NEVER use these - they will break the build:**

```markdown
```yarn
# This breaks Shiki - NO "yarn" language exists
```

```npm
# This breaks Shiki - NO "npm" language exists
```

```pnpm
# This breaks Shiki - NO "pnpm" language exists
```
```

## Package Manager Commands

**We use PNPM** - not yarn, not npm for package management.

### ✅ CORRECT Command Documentation

```markdown
Install dependencies:
```bash
pnpm install
```

Run development server:
```bash
pnpm dev
```

Install a package:
```bash
pnpm add @forge/dev-kit
```
```

### For Consumer Documentation

When documenting for external developers who will use npm:

```markdown
Install the dev-kit:
```bash
npm install @forge/dev-kit
```
```

## Yarn Spinner Language

**Yarn Spinner** is the dialogue scripting language we support - NOT the yarn package manager.

When documenting Yarn Spinner syntax, use `text` or `plaintext`:

```markdown
Yarn Spinner dialogue example:
```text
title: Start
---
Character: Hello, world!
-> Option 1
-> Option 2
===
```
```

## Complete Language Tag Reference

| Content Type | Language Tag | Example |
|-------------|--------------|---------|
| Shell commands | `bash` or `shell` | `npm install` |
| TypeScript | `typescript` or `ts` | `.ts` files |
| React/TSX | `tsx` | `.tsx` components |
| JavaScript | `javascript` or `js` | `.js` files |
| JSON | `json` | Config files |
| YAML | `yaml` or `yml` | Frontmatter |
| CSS | `css` | Styles |
| HTML | `html` | Markup |
| Markdown | `markdown` or `md` | Docs |
| Plain text | `text` or `plaintext` | Generic output |
| Yarn Spinner | `text` | Dialogue scripts |

## Common Mistakes to Avoid

1. **Don't use package manager names as language tags**
   - ❌ ```yarn```
   - ❌ ```npm```
   - ❌ ```pnpm```
   - ✅ ```bash``` for all package manager commands

2. **Don't confuse Yarn Spinner with yarn package manager**
   - Yarn Spinner = dialogue language (use `text`)
   - yarn = old package manager we DON'T use
   - pnpm = package manager we DO use internally

3. **Always specify language for code blocks**
   - ❌ ` ``` ` (no language)
   - ✅ ` ```bash ` (with language)

## Enforcement

1. **Automated Check**: Add to CI/CD to grep for ```yarn, ```npm, ```pnpm
2. **Editor Config**: Configure fumadocs to error on unknown languages
3. **Pre-commit Hook**: Validate all .md and .mdx files before commit

## Quick Fix Script

If you see the Shiki error about unknown language:

```bash
# Find all instances
grep -r '```yarn' apps/platform/content/docs/
grep -r '```npm' apps/platform/content/docs/
grep -r '```pnpm' apps/platform/content/docs/

# Replace with bash
find apps/platform/content/docs/ -name "*.md*" -exec sed -i 's/```yarn/```bash/g' {} +
find apps/platform/content/docs/ -name "*.md*" -exec sed -i 's/```npm/```bash/g' {} +
find apps/platform/content/docs/ -name "*.md*" -exec sed -i 's/```pnpm/```bash/g' {} +
```

## This is Final

**This error should NEVER happen again.**

Any agent or developer writing documentation MUST:
1. Use `bash` for shell commands
2. Never use package manager names as language tags
3. Use `text` for Yarn Spinner dialogue examples
4. Follow this standard strictly
