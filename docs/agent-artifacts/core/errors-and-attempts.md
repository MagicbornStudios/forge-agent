---
title: Errors and attempts
created: 2026-02-04
updated: 2026-02-07
---

Living artifact for agents. Index: [18-agent-artifacts-index.mdx](../../18-agent-artifacts-index.mdx).

# Errors and attempts (do not repeat)

> **For coding agents.** See [Agent artifacts index](../../18-agent-artifacts-index.mdx) for the full list.

Log of known failures and fixes so agents and developers avoid repeating the same mistakes.

---

## Styling: theme variables overridden by globals

**Problem**: Semantic tokens (`--background`, `--foreground`, etc.) were defined in both `packages/shared/src/shared/styles/themes.css` (via `--color-df-*`) and `apps/studio/app/globals.css` (`:root` / `.dark` with raw oklch). Import order caused globals to override the theme.

**Fix**: Removed the duplicate `:root` and `.dark` blocks from `apps/studio/app/globals.css`. Themes.css is the single source for semantic tokens. Set default theme with `data-theme="dark-fantasy"` on `<html>` in `apps/studio/app/layout.tsx`.

---

## Model 429 / 5xx (custom cooldown removed)

**Problem**: Repeated requests to a rate-limited or failing model can exhaust the provider.

**Previous fix (removed)**: We used to record errors via `reportModelError(modelId)` and auto-switch with cooldown. That behavior has been **removed**.

**Current fix**: We use **OpenRouter model fallbacks**: the request body includes `models: [primary, ...fallbacks]`. OpenRouter retries with the next model in the array on rate limit / 5xx within the same request. No app-level health or cooldown. Preferences (primary + fallback chain) are in `server-state.ts`; the CopilotKit route and other OpenRouter call sites (forge/plan, structured-output) pass the `models` array.

---

## Double-registering domain actions

**Problem**: If multiple modes are mounted at once and each calls `useDomainCopilot`, the same action names (e.g. `forge_createNode`) can be registered twice, leading to undefined behavior.

**Fix**: Only the **active** mode is rendered. App Shell renders only DialogueMode or VideoMode, so only one domain contract is active at a time.

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

**Problem**: Using raw `fetch` for collection or app API bypasses the Payload SDK / generated client and duplicates logic; it breaks type safety and makes it easy to drift from the contract.

**Fix**: For collection CRUD (forge-graphs, video-docs), use the Payload SDK (`lib/api-client/payload-sdk.ts`) via the TanStack Query hooks. For custom endpoints (auth, settings, AI), use the generated services or **manual client modules** in `lib/api-client/` (e.g. elevenlabs, media, workflows), or **vendor SDKs** where appropriate. Do not call `fetch` for `/api/*` from components or stores. **New endpoints:** add a manual client module in `lib/api-client/` or use a vendor SDK; the OpenAPI spec is for **documentation only** (it does not support streaming)â€"do not rely on extending it to generate new clients.

## Duplicating collection CRUD in custom routes

**Problem**: Adding custom Next routes that reimplement Payload collection CRUD (e.g. `/api/graphs` that just calls `payload.find`/`create`/`update`) duplicates Payload's built-in REST and is unnecessary.

**Fix**: Use Payload's auto-generated REST (`/api/forge-graphs`, `/api/video-docs`) and the Payload SDK from the client. Add custom routes only for app-specific behavior (e.g. scope-based settings upsert, AI, SSE).

---

## Vendor CLI: npx is not available (ElevenLabs, etc.)

**Problem**: Running `npx @elevenlabs/cli@latest components add audio-player` (or similar) can fail with "Error: npx is not available. Please install Node.js/npm." even when `npx --version` works in the same shell. The CLI often spawns a subprocess that doesn't inherit PATH correctly (e.g. on Windows or with pnpm).

**Fix**: Use **`pnpm dlx @elevenlabs/cli@latest components add <component-name>`** from the directory that has `components.json` (e.g. `cd packages/ui` for shared). If that still fails, install the CLI globally: `npm i -g @elevenlabs/cli`, then run `elevenlabs components add <name>` from that directory.

---

## Twick CSS/JS resolution (build)

**Problem**: Build fails with "Can't resolve '@twick/timeline/dist/timeline.css'" or "Can't resolve '@twick/live-player'" / "Can't resolve '@twick/studio'". Twick packages may be missing from the lockfile, or the registry was unreachable.

**Fix**: (1) Use `workspace:*` for internal `@forge/*` deps in `packages/agent-engine`, `packages/shared`, and `packages/dev-kit` so `pnpm install` does not require Verdaccio. (2) Run `pnpm install --no-frozen-lockfile` from the repo root to resolve and lock all Twick packages. (3) In `apps/studio/app/globals.css`, import only `@twick/studio/dist/studio.css`; do not import `@twick/timeline/dist/timeline.css` â€" the published npm package does not ship that file (studio bundles timeline styles).

---

## CSS @import must precede all rules (globals.css parse error)

**Problem**: `pnpm dev` fails with "Parsing CSS source code failed" at `globals.css` (compiled line ~1115): `@import rules must precede all rules aside from @charset and @layer statements`. The offending lines are `@import url('https://fonts.googleapis.com/...')` (Inter, JetBrains Mono, Rubik, Mulish, etc.).

**Root cause**: A dependency (almost certainly `@twick/studio/dist/studio.css` or something it pulls in) contains `@import url(...)` for Google Fonts. When `apps/studio/app/globals.css` is processed by PostCSS/Tailwind, the pipeline order produces a single CSS file where Tailwind's expanded rules appear first (~1100+ lines), then the inlined content from `@import "@twick/studio/dist/studio.css"` appears, so the font `@import` ends up after other rules. CSS requires all `@import` to be at the top.

**Attempted fix (insufficient)**: Moving all `@import` in globals.css to the very top (tw-animate, shared styles, studio) so they are "first" in the source file. This did not fix it because the Tailwind/PostCSS pipeline expands `@tailwind base/components/utilities` and merges dependency CSS in an order that still places dependency-injected `@import url()` after those rules in the final output.

**Fix**: Added a PostCSS plugin that hoists all `@import url(...)` rules to the top of the compiled CSS. See `apps/studio/scripts/postcss-hoist-import-url.cjs` and `apps/studio/postcss.config.mjs` (plugin runs after `@tailwindcss/postcss`). The config resolves the plugin with an absolute path (`path.join(__dirname, 'scripts', 'postcss-hoist-import-url.cjs')`) so Next/Turbopack can load it when PostCSS runs from `.next`. If this error reappears (e.g. after a dependency update), ensure the hoist plugin still runs after Tailwind and that it handles any new @import from the dependency.

---

## "getSnapshot should be cached" / useSyncExternalStore loop

**Problem**: Console error "The result of getSnapshot should be cached to avoid an infinite loop", often followed by "Maximum update depth exceeded". Triggered when a Zustand selector returns a **new object or array reference** every time (e.g. `state.getMergedSettings(...)` which spreads and returns a new object). React's `useSyncExternalStore` requires the snapshot to be referentially stable when state has not changed; a new reference each time is treated as a change and causes re-render â†’ getSnapshot again â†’ infinite loop.

**Fix**: Do not select merged or derived objects from the store in components. Use selectors that return **primitives or stable references** only (e.g. `(s) => s.getSettingValue('ai.agentName', ids)` with stable `ids`). Build any object needed in the component with `useMemo` from those primitive values. Optionally, the store can cache merged result per key and return the same reference when underlying data is unchanged.

---

## "Maximum update depth exceeded" with setRef in EditorTab/EditorTooltip

**Problem**: "Maximum update depth exceeded" in React, with stack pointing to Radix UI `setRef` and `EditorApp.Tab` / `EditorTooltip` / `AppShell`. Nested Radix Tooltips (e.g. one around the tab, one around the close button) and ref merging (`TooltipTrigger asChild`) can trigger setState inside ref callbacks, causing a re-render loop.

**Fix**: Avoid nested tooltips: use a native `title` attribute for the close button instead of wrapping it in a second `EditorTooltip`. When the tab has no tooltip, do not wrap the tab in `EditorTooltip` at all (render the tab element directly). If the loop persists, wrap the tab root in a `React.forwardRef` component so the ref target has a stable identity.

---

## MdxBody type error when using body as JSX component

**Problem**: In `apps/studio/app/docs/[[...slug]]/page.tsx`, `body` from `page.data` is narrowed to `body` when `typeof body === 'function'`, but TypeScript infers that as a generic `Function`. JSX requires a construct/call signature (e.g. `React.ComponentType`), so `<MdxBody components={mdxComponents} />` fails type-check.

**Fix**: Cast `body` to a React component type when assigning: `(typeof body === 'function' ? body : null) as React.ComponentType<{ components: typeof mdxComponents }> | null`. Keep the existing render: `{MdxBody ? <MdxBody components={mdxComponents} /> : null}`.

---

## BuiltInAgent / OpenRouter SDK incompatibility

**Problem**: Using `@openrouter/ai-sdk-provider` (e.g. `createOpenRouter`) for the CopilotKit agent causes interface mismatch. CopilotKit expects `openai` for the adapter and `@ai-sdk/openai` for BuiltInAgent; the OpenRouter provider uses a different shape. We swapped runtimes multiple times trying to use the OpenRouter SDK.

**Fix**: Do **not** use `@openrouter/ai-sdk-provider` for the CopilotKit route or for `createForgeCopilotRuntime` in shared. Use **OpenAI** (`openai` package) with `baseURL: config.baseUrl` and **createOpenAI** from `@ai-sdk/openai` with the same baseURL. Model fallbacks are implemented via a custom fetch that injects `models: [primary, ...fallbacks]` into the request body (see [openrouter-fetch.ts](../../apps/studio/lib/model-router/openrouter-fetch.ts)). Reference: [06-model-routing-and-openrouter.mdx](../../architecture/06-model-routing-and-openrouter.mdx).

---

*(Add new entries when new errors are found and fixed.)*
