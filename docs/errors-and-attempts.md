# Errors and attempts (do not repeat)

Log of known failures and fixes so agents and developers avoid repeating the same mistakes.

---

## Styling: theme variables overridden by globals

**Problem**: Semantic tokens (`--background`, `--foreground`, etc.) were defined in both `packages/shared/src/shared/styles/themes.css` (via `--color-df-*`) and `apps/studio/app/globals.css` (`:root` / `.dark` with raw oklch). Import order caused globals to override the theme.

**Fix**: Removed the duplicate `:root` and `.dark` blocks from `apps/studio/app/globals.css`. Themes.css is the single source for semantic tokens. Set default theme with `data-theme="dark-fantasy"` on `<html>` in `apps/studio/app/layout.tsx`.

---

## Model 429 / 5xx and cooldown

**Problem**: Repeated requests to a rate-limited or failing model can exhaust the provider.

**Fix**: Model router records errors via `reportModelError(modelId)` in the CopilotKit route on 429/5xx. Auto-switch excludes models in cooldown (exponential backoff: 15s -> 30s -> 60s -> ... up to 5 min). Success clears cooldown via `reportModelSuccess(modelId)`.

---

## Double-registering domain actions

**Problem**: If multiple workspaces are mounted at once and each calls `useDomainCopilot`, the same action names (e.g. `forge_createNode`) can be registered twice, leading to undefined behavior.

**Fix**: Only the **active** workspace is rendered. App Shell renders either ForgeWorkspace or VideoWorkspace, so only one domain contract is active at a time.

---

## Payload type generation failing via CLI

**Problem**: Running `payload generate:types` directly can fail with ESM/require errors when loading `payload.config.ts` on Node 24.

**Fix**: Use `pnpm payload:types`, which calls `node scripts/generate-payload-types.mjs`. This script loads collections via `tsx/esm/api`, builds config, and writes to `packages/types/src/payload-types.ts`.

---

## pnpm blocked by PowerShell execution policy

**Problem**: PowerShell can block `pnpm.ps1` with "running scripts is disabled" errors.

**Fix**: Run via `cmd /c pnpm <command>` (or use a shell where script execution is allowed).

---

## Payload dynamicImport warning during build

**Problem**: Next build may warn about `payload/dist/utilities/dynamicImport.js` using an expression for dynamic import.

**Fix**: This warning is expected from Payload and does not block the build. Treat it as informational unless it turns into a hard error.

---

---

## Raw fetch for API routes

**Problem**: Using raw `fetch('/api/graphs')`, `fetch('/api/video-docs')`, etc., bypasses the generated client and duplicates logic. It also breaks type safety and makes it easy to drift from the OpenAPI spec.

**Fix**: Use the generated client (`apps/studio/lib/api-client/`) or the TanStack Query hooks in `apps/studio/lib/data/hooks/`. Do not call `fetch` for `/api/*` from components or stores. Add or update JSDoc on route handlers and run `pnpm generate-client` after API changes.

---

*(Add new entries when new errors are found and fixed.)*
