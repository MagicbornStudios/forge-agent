---
title: Errors and attempts
created: 2026-02-04
updated: 2026-02-12
---

Living artifact for agents. Index: [18-agent-artifacts-index.mdx](../../18-agent-artifacts-index.mdx).

# Errors and attempts (do not repeat)

> **For coding agents.** See [Agent artifacts index](../../18-agent-artifacts-index.mdx) for the full list.

Log of known failures and fixes so agents and developers avoid repeating the same mistakes.

---

## Agent behavior: user correction overrides agent assumptions

**Rule**: When the user explicitly tells an agent that a hypothesis or fix is wrong, the agent must stop believing and acting on it. User correction overrides external documentation, web search results, or prior agent conclusions.

**Do**:
- Note the correction in errors-and-attempts and do not repeat the forbidden approach.
- Push back once with evidence if the agent has strong contrary data; then defer to the user.
- Update docs (AGENTS.md, errors-and-attempts, STATUS) so future agents find the correction.

**Do not**:
- Re-implement a fix the user forbade.
- Assume stack-trace location equals root cause when the user says otherwise.
- Be stubborn: correct once, then stop.

**Example**: Radix composeRefs / ScrollArea replacement was identified as a fix; user forbade it and confirmed it was a false positive. Existing entry: "Radix composeRefs hypothesis (FALSE POSITIVE)".

---

## Dock slot content must be reactive (Inspector / slot-dependent UI)

**Problem**: Selecting a node in one graph did not show the selection in the Inspector until the user focused another panel (e.g. the other graph). State (selection, activeScope) updated correctly, but the right-panel (slot) content did not re-render because Dockview controls when `SlotPanel` is rendered; when only React context changed (new `right={inspectorContent}` from the editor), Dockview did not re-render the panel.

**Fix**: Use a **slot content store** (Zustand) so slot content drives re-renders independently of Dockview. In `DockLayout.tsx`: (1) Create a module-level store holding `slots: Record<string, React.ReactNode>` and a `version` that bumps on each write. (2) In `DockLayoutRoot`, sync the resolved context value (left, main, right, rightInspector, rightSettings, bottom) into the store in `useLayoutEffect` when it changes. (3) In `SlotPanel`, subscribe to the store by `slotId` (e.g. `useSlotContentStore(s => ({ content: s.slots[slotId], version: s.version }))`) and render the stored content, with context as fallback. Then when the editor passes new `right={inspectorContent}`, the store updates and `SlotPanel` re-renders without requiring focus elsewhere. Ensure editor slot content (e.g. Inspector) is not over-memoized—dependency arrays should include `activeSelection`, `inspectorSections`, etc. When using a selector that returns an object or array, wrap with **useShallow** to avoid getSnapshot infinite loop (see next entry).

---

## Zustand: getSnapshot infinite loop when selector returns new object/array

**Problem**: Using a Zustand store with a selector that returns a new object or array every time (e.g. `(s) => [s.foo, s.bar] as const` or `(s) => ({ a: s.a })`) causes React to log "The result of getSnapshot should be cached to avoid an infinite loop" and can cause an infinite render loop. useSyncExternalStore treats any new reference as a change.

**Fix**: Use `useShallow` from `zustand/shallow` to wrap the selector so the result is shallow-compared; only when the shallow comparison fails will the component re-render. Alternatively, select only primitives (e.g. `s.slots[id]` plus a separate selector for `s.version` if both are needed, or a single primitive that changes when either changes).

---

## Hydration mismatch: invalid interactive nesting (`button` descendants)

**Problem**: React/Next hydration failed with errors like `In HTML, <button> cannot be a descendant of <button>`. In this repo, two concrete cases were found:

- `apps/studio/components/settings/SettingsPanel.tsx`: toggle row rendered a native `<button>` wrapper containing `Switch` (Radix button).
- `packages/ui/src/components/ui/dropzone.tsx`: dropzone root used `Button` (renders `<button>`) and nested `<input>`.

**Fix**:

- Replace outer native button wrappers with non-button containers when they must contain interactive controls.
- Preserve row-click behavior with container `onClick` and `stopPropagation` on inner controls (Reset/Switch).
- For non-form clickable surfaces (e.g. dropzone), use a styled `div` root (`buttonVariants`) + dropzone root props instead of a button root when an `<input>` child is required.

**Guardrail**:

- Added `scripts/hydration-nesting-doctor.mjs` and root script `pnpm hydration:doctor`.
- Root `lint` now runs `pnpm hydration:doctor` before Studio lint.

---

## Assistant UI tooltip runtime crash in docs previews (`TooltipProvider` missing)

**Problem**: Rendering assistant-ui surfaces in docs component previews (e.g. `CodebaseAgentStrategyEditor`) crashed with:

- `` `Tooltip` must be used within `TooltipProvider` ``

**Cause**: `TooltipIconButton` is used throughout assistant-ui thread controls, and docs previews can render outside the main app provider stack, so no tooltip context exists.

**Fix**:

- Wrap `CodebaseAgentStrategyEditor` with shared `AppProviders` (includes tooltip provider by default).
- Wrap docs `ComponentPreview` body with `AppProviders` to harden all preview examples rendered outside app-shell providers.

References:

- `packages/shared/src/shared/components/assistant-ui/CodebaseAgentStrategyEditor.tsx`
- `apps/studio/components/docs/ComponentPreview.tsx`

---

## Settings inner tabs (AI / Appearance / Panels / Other) not updating until focus on graph

**Problem**: In the Settings panel (right dock panel → Settings tab), switching between the inner tabs (AI, Appearance, Panels, Other) did not update the tab highlight or content until the user focused the **graph panel** (not the library or other areas). The tab state lived inside `AppSettingsPanelContent`; when it updated, only that subtree re-rendered. The right slot content is provided to Dockview via context; `SlotPanel` only re-renders when the context value (the `right` element) changes. That value is created by the layout parent (e.g. DialogueEditor). So when only `AppSettingsPanelContent`'s state changed, the parent did not re-render, the context value did not change, and the slot did not re-render—so the tab visual did not update until something else (e.g. focusing the graph) caused the layout parent to re-render and refresh the slot.

**Preferred fix**: **Universal Settings Sidebar (right rail).** Use a single Settings Sidebar at app shell level (shadcn `Sidebar` with `side="right"`), containing `AppSettingsPanelContent`. When Settings is the root of its own surface (sidebar or a dedicated dock panel), inner tab state updates re-render correctly. AppShell wraps content in `SidebarProvider` and renders the Settings Sidebar with `activeEditorId`, `activeProjectId`, and `settingsViewportId` from the store; editors set `setSettingsViewportId(viewportId)` when their viewport/scope changes so the Panels tab shows the right context (e.g. narrative vs storylet). "Open Settings" opens the sidebar. The right dock is Inspector-only (single `right` panel). If the right dock showed empty ("nothing is rendering"), the cause was often a saved layout with panel id `right` while the app only provided `right-inspector`/`right-settings` content; reverting to a single `right` panel and moving Settings to the sidebar fixes both.

**Alternative (legacy) fix**: **Lift the inner tab state** to the parent that owns the slot content so that when the user changes the inner tab, that parent re-renders and the slot context value updates. (1) In the editor, add state for the Settings inner category (e.g. `settingsInnerCategory` / `setSettingsInnerCategory`). (2) Pass it to `AppSettingsPanelContent` as a controlled prop (e.g. `controlledCategory={{ appUserCategory, onAppUserCategoryChange }}`). (3) In `AppSettingsPanelContent`, support optional `controlledCategory`; when provided, use it instead of internal state. (4) Include the inner category in the **key** of the right-panel content so the slot content identity changes and Dockview/SlotPanel receive a fresh tree. (5) Keep `key={value}` on the Radix Tabs in SettingsTabs as a secondary aid. When the component is used outside the dock (e.g. in AppSettingsSheet), omit `controlledCategory` so it keeps using internal state.

**Wrong fix (do not repeat):** (1) Fixing the **Inspector/Settings** two-tab strip instead of the **Settings inner tabs**. (2) Adding only `key={value}` to the Radix `Tabs` in SettingsTabs—that alone does not fix it when the slot content is rendered by Dockview and does not re-render on inner state change.

---

## Zustand: select derived value for reactivity, not the getter

**Problem**: Toggling a setting in Settings (e.g. "Show minimap" in Panels) did not update the UI (e.g. graph minimap) until the user switched panels or refocused. The component was subscribing to the store with `useSettingsStore((s) => s.getSettingValue)` and then calling `getSettingValue(key, ids)` in render. The selector returns the same function reference when the store updates, so Zustand does not re-render when the underlying state (e.g. `viewportSettings`) changes.

**Fix**: Select the **derived value** so the component subscribes to the slice that actually changes. For example: `useSettingsStore((s) => (s.getSettingValue('graph.showMiniMap', { editorId, viewportId }) as boolean | undefined) ?? true)`. Then when that key in the store changes, the selector result changes and the component re-renders. Use the same pattern for any setting that must stay in sync across Settings and consumers (e.g. graph viewport settings).

---

## Logging: use Studio logger, no ad-hoc console

**Guidance:** Do not add ad-hoc `console.log` / `console.warn` / `console.error` for model routing or API flows. Use the Studio logger: `getLogger('namespace')` from `apps/studio/lib/logger.ts` with the appropriate level and structured fields so logs can be turned off via `LOG_LEVEL` or inspected in the log file. Client-only code (e.g. model-router store) uses `clientLogger` from `@/lib/logger-client` when logging to the server is enabled.

---

## Marketing Hero: do not use placeholder YouTube IDs

**Problem**: Hero "Watch Demo" previously opened a dialog with a placeholder YouTube embed (generic or test ID), which could confuse users or look unprofessional.

**Fix**: Do not embed real YouTube URLs in Hero until we have a real product demo asset. "Watch Demo" links to `/demo`; the hero product preview block links to `/roadmap` ("See what we're building"). When a real demo video exists, wire it in `HeroBlock` or `HeroVideoDialog` and remove the /demo redirect. See [HeroBlock.tsx](../../apps/marketing/components/sections/HeroBlock.tsx).

---

## Grey buttons and missing menu/icons

**Problem**: Toolbar and menu items appeared flat grey and text-only; the AI intent card had tight padding and looked flush to borders.

**Fix**: (1) Use `outline` (or `default`) for File menu trigger and primary toolbar actions so they are not ghost-only. (2) Add optional `icon` to `EditorMenubarItem` and `EditorFileMenuItem`, and pass icons from DialogueEditor/CharacterEditor for View, State, and File menu items. (3) Add icons to editor creation buttons and Workbench in AppShell/DialogueEditor. (4) Use `p-[var(--panel-padding)]` (and content padding) in cards (e.g. AgentWorkflowPanel). Design docs 01 and 02 updated with icon/padding rules and screenshot reference ([docs/design/01-styling-and-theming.mdx](../../design/01-styling-and-theming.mdx), [02-components.mdx](../../design/02-components.mdx)).

---

## Input icons and badge padding (overlap + cramped tags)

**Problem**: Search inputs and command palettes showed oversized icons that overlapped text; tag/badge pills (e.g. model provider + v2 chips) appeared cramped with no padding.

**Fix**: Use `--icon-size` for input/command icons and calculate left padding with `pl-[calc(var(--control-padding-x)+var(--icon-size)+var(--control-gap))]` to ensure text never collides. Tokenize command/menu/select padding to `--control-*` and `--menu-*`. For tags, rely on `--badge-padding-x/y` in `Badge` and avoid overriding with ad-hoc `px-*`/`h-*`. See [styling-and-ui-consistency.md](./styling-and-ui-consistency.md) and [design/01-styling-and-theming.mdx](../../design/01-styling-and-theming.mdx).

---

## Fumadocs docs runtime on Next 15.5.9 (`useEffectEvent` + provider mismatch)

**Problem**: Studio docs hit runtime failures when using full Fumadocs runtime components:

- `You need to wrap your application inside FrameworkProvider.`
- `useEffectEvent is not a function` from Fumadocs page/client modules.

**Cause**: On this stack (`next@15.5.9`), importing `fumadocs-ui/page` (and related runtime providers) can pull client paths that rely on `useEffectEvent`, which is not available in the Turbopack-resolved runtime path.

**Current working pattern (2026-02-10)**:

- Use **headless Fumadocs source** (`source.getPageTree()` + `source.serializePageTree`) with the shared docs shell (`DocsLayoutShell`) for Studio docs chrome.
- Keep `fumadocs-ui/page` and `fumadocs-ui/layouts/docs` out of Studio docs route files.
- Keep route-scoped stylesheet import (`@import "fumadocs-ui/style.css";`) in `apps/studio/app/docs/docs.css` for MDX component styling.
- Keep token bridge (`--color-fd-*` -> Studio/shadcn semantic tokens) and custom MDX overrides (`fumadocs-ui/mdx` + Forge blocks).

**Guardrail**:

- Added `pnpm docs:runtime:doctor` (wired into `pnpm docs:doctor`) to fail if Studio docs reintroduces runtime Fumadocs layout/page imports.
- If switching to `fumadocs-ui/css/preset.css`, re-run full CSS/build verification first; this repo previously hit Tailwind utility resolution issues on that path.

References:

- `apps/studio/app/docs/layout.tsx`
- `apps/studio/app/docs/[[...slug]]/page.tsx`
- `apps/studio/app/docs/DocsShell.tsx`
- `apps/studio/app/docs/mdx-components.tsx`
- `apps/studio/app/docs/docs.css`
- `scripts/docs-runtime-doctor.mjs`

---

## Legacy custom docs shell felt raw (missing top tabs, weak sidebar, weak TOC)

**Problem**: Even with the stable custom renderer, docs still looked unfinished: no strong top navigation tabs, sparse sidebar hierarchy, and low-contrast TOC/typography.

**Fix**: Upgrade the shared docs shell primitives instead of switching runtimes:

- `DocsLayoutShell`: sticky top tabs, brand header, mobile sidebar trigger, GitHub link, better content width/padding, sidebar inset offset.
- `DocsSidebar`: section icons (Lucide), collapsible folder groups, search input, stronger active/hover styling, and compact hierarchy spacing.
- `RightToc`: stronger "On this page" rail, indentation by heading depth, active hash highlighting.
- Docs article typography tuned in studio/marketing page renderers (headers, spacing, tables, links, blockquotes).

References:

- `packages/shared/src/shared/components/docs/DocsLayoutShell.tsx`
- `packages/shared/src/shared/components/docs/DocsSidebar.tsx`
- `packages/shared/src/shared/components/docs/RightToc.tsx`
- `apps/studio/app/docs/[[...slug]]/page.tsx`
- `apps/marketing/app/(marketing)/docs/[[...slug]]/page.tsx`

---

## Legacy custom docs shell parity regressions (generic labels, weak TOC tracking, sidebar/header overlap)

**Problem**: Docs styling rendered, but quality still regressed vs common docs templates:

- Sidebar/top tabs showed fallback labels like `Doc` / `Section`.
- Right TOC only updated on `hashchange` (not while scrolling).
- Sidebar content was clipped under the sticky header (desktop overlap).

**Cause**:

- Fumadocs page-tree names are `ReactNode`; our label extraction accepted only string/number.
- TOC state depended only on `window.location.hash` events.
- Sidebar is fixed-position (`inset-y-0`) and needed explicit top offset below header in this shell.

**Fix**:

- Added shared label helpers in `packages/shared/src/shared/components/docs/tree-label.ts`:
  - `toPlainText(node, fallback)` handles ReactNode arrays/elements/`dangerouslySetInnerHTML`.
  - `toTitleFromHref(href, fallback)` provides deterministic fallback labels.
- Updated docs shell/sidebar to use the shared helpers and remove generic label fallback dependency:
  - `packages/shared/src/shared/components/docs/DocsLayoutShell.tsx`
  - `packages/shared/src/shared/components/docs/DocsSidebar.tsx`
- Added shared header height var and desktop sidebar offset (`--docs-header-height`) so sidebar starts below header.
- Upgraded TOC to scroll-aware active tracking via `IntersectionObserver`, with an active rail thumb:
  - `packages/shared/src/shared/components/docs/RightToc.tsx`
- Added docs-shell regression tests and a single command guardrail:
  - `apps/studio/__tests__/docs/*`
  - `pnpm docs:doctor` (runs css doctor + docs tests)

---

## Legacy custom docs shell still felt cramped (left overlap, search icon collision, weak tree depth)

**Problem**: After parity fixes, docs still had UX issues in real usage:

- Main docs content/header could still feel overlapped by the fixed left sidebar.
- Sidebar search icon could collide with input text.
- Folder nesting looked flat (section-like) instead of file-tree hierarchy.
- Markdown tables/readability felt weak for long docs pages.

**Cause**:

- The shell relied on inset `margin-left` for sidebar offset; fixed sidebar + inset sizing still produced cramped behavior in some layouts.
- Sidebar search input left padding was too tight for the leading icon.
- Folder headers were styled as uppercase section labels with subtle nesting rails.
- Article typography/table styles were duplicated per app and not strong enough.

**Fix**:

- Move docs-shell left offset to provider padding (`md:pl-[var(--sidebar-width)]`) and keep sidebar fixed under header (`md:top`, `md:bottom-auto`, computed height).
- Improve top tab overflow handling/truncation to reduce header squeeze.
- Increase search input icon spacing (`pl-9`) and keep icon placement stable.
- Strengthen sidebar hierarchy styling:
  - normal-case folder labels,
  - stronger nested rails/indent,
  - branch connectors for nested items.
- Introduce shared docs article class preset:
  - `packages/shared/src/shared/components/docs/doc-content.ts` (`DOCS_ARTICLE_CLASS`),
  - used by both Studio and Marketing docs page renderers.
- Render fallback body content when `page.data.body` is not a function component (prevents missing content on mixed markdown/MDX shapes).

References:

- `packages/shared/src/shared/components/docs/DocsLayoutShell.tsx`
- `packages/shared/src/shared/components/docs/DocsSidebar.tsx`
- `packages/shared/src/shared/components/docs/RightToc.tsx`
- `packages/shared/src/shared/components/docs/doc-content.ts`
- `apps/studio/app/docs/[[...slug]]/page.tsx`
- `apps/marketing/app/(marketing)/docs/[[...slug]]/page.tsx`

---

## Docs article link hover scope + docs rails visibility fallback

**Problem**:

- Hovering the docs main article caused **all links** to underline at once.
- In some desktop-width sessions, docs header tabs / left sidebar / right TOC could appear missing, making the shell feel broken.

**Cause**:

- `DOCS_ARTICLE_CLASS` used `hover:[&_a]:underline`, which scopes underline to the parent hover state, not each anchor.
- Docs rail visibility relied only on utility breakpoint variants; when those conditions regressed in-session, rails stayed hidden.

**Fix**:

- Change link hover selector to per-anchor: `[_a:hover]:underline`.
- Add explicit docs-shell fallback media rules in `apps/studio/app/docs/docs.css`:
  - at `>=48rem`: force desktop sidebar container and top tabs visible,
  - at `>=64rem`: force right TOC visible.
- Add stable hook classes for fallback targeting:
  - `forge-docs-tabs` in `DocsLayoutShell`.
  - `forge-docs-toc` in `RightToc`.

References:

- `packages/shared/src/shared/components/docs/doc-content.ts`
- `packages/shared/src/shared/components/docs/DocsLayoutShell.tsx`
- `packages/shared/src/shared/components/docs/RightToc.tsx`
- `apps/studio/app/docs/docs.css`

---

## Docs sidebar overlay/clipping and TOC hierarchy spacing polish

**Problem**:

- Desktop docs sidebar could overlap content instead of reliably displacing main content.
- Sidebar top section could appear clipped behind the sticky header.
- TOC looked cramped (no clear inner margin rhythm) and hierarchy connector lines sat too close to numbered headings.

**Cause**:

- Desktop displacement/top offset depended on utility variants only; when that path regressed, sidebar stayed fixed but content offset/top sizing did not fully apply.
- TOC container/link rhythm and connector geometry were too tight for numbered headings.

**Fix**:

- Harden desktop docs layout in route CSS (`apps/studio/app/docs/docs.css`) with explicit media-query fallbacks:
  - force provider left padding (`padding-left: var(--sidebar-width)`),
  - force sidebar top/height (`top: var(--docs-header-height)`, `height: calc(100svh - var(--docs-header-height))`, `bottom: auto`),
  - keep desktop rails visible as fallback.
- Increase docs header height token to `4rem` in `DocsLayoutShell` to prevent top clipping.
- Improve TOC spacing/legibility in `RightToc`:
  - add padded rounded TOC container,
  - add more link padding/vertical rhythm,
  - shift and shorten hierarchy connector lines so they don’t crowd numbered text.

References:

- `apps/studio/app/docs/docs.css`
- `packages/shared/src/shared/components/docs/DocsLayoutShell.tsx`
- `packages/shared/src/shared/components/docs/RightToc.tsx`

---

## Better Auth-style TOC spacing parity (explicit gutters + rail geometry)

**Problem**:

- Even after initial TOC polish, links could still look visually flush against the TOC container edge.
- TOC hierarchy rail/connector spacing still looked tighter than the target Better Auth pattern.

**Cause**:

- TOC spacing depended mostly on utility class composition; visual rhythm remained too tight for this docs aesthetic.
- Rail and connector offsets were not tuned as a single geometry system (container padding, rail x-position, link padding, connector length).

**Fix**:

- Added explicit route-scoped TOC classes in `apps/studio/app/docs/docs.css` for deterministic spacing:
  - `.forge-docs-toc-inner` (outer gutters),
  - `.forge-docs-toc-nav` (padded inner card),
  - `.forge-docs-toc-nav::before` (vertical rail geometry),
  - `.forge-docs-toc-link` (consistent link padding),
  - `.forge-docs-toc-thumb` (active indicator aligned to rail).
- Updated `RightToc` markup to use these classes and tuned depth/connector geometry:
  - width `w-72`,
  - depth step `14px`,
  - connectors shifted left and lengthened so numbers/text have breathing room.

References:

- `packages/shared/src/shared/components/docs/RightToc.tsx`
- `apps/studio/app/docs/docs.css`

---

## Docs sidebar directory styling, truncation, and ultra-slim scroll behavior

**Problem**:

- Sidebar structure felt flat and not file-directory-like.
- Long doc titles could visually overflow/crowd the sidebar.
- Sidebar scrollbar looked heavy vs modern docs UIs.

**Cause**:

- Sidebar rows/icons were generic and depth spacing was shallow.
- Truncation depended on partial `truncate` usage without consistent `min-w-0`/overflow constraints on all row variants.
- Default scroll-area scrollbar treatment remained too visible for docs navigation.

**Fix**:

- Updated docs sidebar tree rendering to a directory pattern:
  - folder rows use left chevron + folder open/closed icons,
  - file rows use file-oriented icons (with API/reference pages getting a code-file icon),
  - deeper indentation and clearer branch line rhythm (Cursor-like tree feel).
- Hardened truncation in both folder and file rows:
  - `min-w-0` + `overflow-hidden` containers,
  - `truncate` on labels,
  - `title` attributes for full-name hover reveal.
- Added route-scoped scrollbar styling for docs sidebar:
  - native viewport scrollbar hidden,
  - Radix scroll thumb reduced to an ultra-slim 4px rail that fades in on hover.

References:

- `packages/shared/src/shared/components/docs/DocsSidebar.tsx`
- `apps/studio/app/docs/docs.css`

---

## Legacy custom docs sidebar trigger not opening (no client boundary)

**Problem**: Docs sidebar icon was visible, but clicking it did nothing; the left sidebar and right TOC never appeared to hydrate.

**Cause**: `DocsLayoutShell` (client-only, uses hooks like `usePathname`) was imported directly into a **server** `page.tsx` from the bundled `@forge/shared` entrypoint. Because the bundle does not carry a module-level `"use client"` directive, Next treated the import as server code and skipped client hydration for the docs shell.

**Fix**: Wrap `DocsLayoutShell` in a local client component and use that in the docs pages, so the docs shell is in a client boundary. Example: `apps/studio/app/docs/DocsShell.tsx` and `apps/marketing/app/(marketing)/docs/DocsShell.tsx`, then render `<DocsShell ...>` from the server page. Also ensure Tailwind `@source` includes `packages/shared` in marketing so docs shell classes compile.

---

## Tailwind v4 arbitrary CSS variable values output invalid CSS

**Problem**: Layout and popover sizing broke (docs sidebar width, Radix popover/menu/select sizing, tooltip/menubar/hover-card origin). Utilities like `w-[--sidebar-width]` and `origin-[--radix-*-transform-origin]` generated invalid CSS (`width: --sidebar-width`), so styles were effectively ignored.

**Cause**: Tailwind v4 no longer auto-wraps `--var` in `var(...)` for arbitrary values.

**Fix**: Replace `[...]` values that reference CSS variables with explicit `var(--...)`, e.g. `w-[var(--sidebar-width)]`, `max-h-[var(--radix-select-content-available-height)]`, and `origin-[var(--radix-dropdown-menu-content-transform-origin)]`. Updated shared UI components (`@forge/ui`) plus marketing and shared components that used Radix CSS vars.

---

## Docs styles partially missing (Tailwind v4 partial utility generation)

**Problem**: Docs rendered with only partial styling: some classes worked (e.g. typography/arbitrary values), but layout-critical utilities such as `px-4`, `h-14`, `md:hidden`, `lg:px-10`, `max-w-4xl`, and docs shell offset utilities were missing from compiled CSS.

**Cause**: `apps/studio/app/globals.css` and `apps/marketing/app/globals.css` still used legacy `@tailwind base/components/utilities` directives in a Tailwind v4 setup. In this repo pipeline, that could compile a partial utility set and break docs shell layout. Marketing also had `@import` ordering drift (imports after Tailwind directives), making failures harder to diagnose.

**Fix**:

- Migrate app globals to Tailwind v4 canonical import: `@import "tailwindcss";`.
- Keep all CSS `@import` rules grouped at the top of each globals file.
- Add strict diagnostics script: `scripts/css-doctor.mjs` and root scripts `css:doctor`, `css:doctor:studio`, `css:doctor:marketing`.
- `css:doctor` validates:
  - no legacy `@tailwind` directives in globals;
  - no `@import` ordering violations;
  - generated utility probes for docs layout classes.

References:

- `apps/studio/app/globals.css`
- `apps/marketing/app/globals.css`
- `scripts/css-doctor.mjs`
- `package.json`

---

## Styling: theme variables overridden by globals

**Problem**: Semantic tokens (`--background`, `--foreground`, etc.) were defined in both `packages/shared/src/shared/styles/themes.css` (via `--color-df-*`) and `apps/studio/app/globals.css` (`:root` / `.dark` with raw oklch). Import order caused globals to override the theme.

**Fix**: Removed the duplicate `:root` and `.dark` blocks from `apps/studio/app/globals.css`. Themes.css is the single source for semantic tokens. Set default theme with `data-theme="dark-fantasy"` on `<html>` in `apps/studio/app/layout.tsx`.

---

## Theme/surface tokens (contrast in sidebar and app bar)

**Problem**: Using `bg-background` or `text-foreground` inside a different surface (e.g. sidebar, app bar strip) can produce wrong contrast (e.g. dark text on dark background), because those tokens are global.

**Fix**: Use surface-specific tokens. Inside sidebar use `bg-sidebar` / `text-sidebar-foreground` (and `sidebar-accent` for hover). For popovers use `bg-popover` / `text-popover-foreground`; for cards/panels use `bg-card` / `text-card-foreground`. Do not use `bg-background` or `text-foreground` in non-body surfaces. See [01 - Styling and theming — Token system](../../design/01-styling-and-theming.mdx#token-system-layers-and-when-to-use-which).

---

## Toolbar buttons not switching with theme

**Problem**: When switching app theme (e.g. Dark Fantasy to Cyberpunk), some toolbar controls (e.g. project switcher trigger "Demo Project", ghost toolbar buttons) did not update and appeared stuck with a light or default look.

**Cause**: The ghost button variant in `packages/ui` had only hover styles (`hover:bg-accent hover:text-accent-foreground`) and no base `bg-*` or `text-*`, so the default state inherited browser/parent styling, which is not driven by theme CSS variables.

**Fix**: (1) In `packages/ui/src/components/ui/button.tsx`, give the ghost variant an explicit default state: `bg-transparent text-foreground` so the default state is theme-driven. (2) For toolbar triggers, prefer `outline` (or `default`) per design rules; ProjectSwitcher compact trigger was changed to `variant="outline"` to match other app bar buttons. See [styling-and-ui-consistency.md](./styling-and-ui-consistency.md).

---

## Model routing: two providers, server-state only

**Design**: Two slots — `copilotModelId` and `assistantUiModelId` — in in-memory server-state. **No model ID in request**: CopilotKit and assistant-chat handlers use only `getCopilotModelId()` and `getAssistantUiModelId()`; do not send `x-forge-model` or body `modelName`. Client updates model only via POST to `/api/model-settings` with `{ provider: 'copilot' | 'assistantUi', modelId }`. One **ModelSwitcher** component with `provider` prop; same UX for both. Default from code via `getDefaultChatModelId()` (no model IDs in .env). Use naming `copilot` / `assistantUi` everywhere (type `ModelProviderId`); no "sidebar" or "strategy" in the model layer. See [06-model-routing-and-openrouter.mdx](../../architecture/06-model-routing-and-openrouter.mdx).

---

## Model 429 / 5xx (custom cooldown removed)

**Problem**: Repeated requests to a rate-limited or failing model can exhaust the provider.

**Current fix**: CopilotKit and assistant-chat use a **single model** from server-state (no fallbacks). Task routes (forge/plan, structured-output) use `DEFAULT_TASK_MODEL`. No app-level health or cooldown. If we reintroduce fallbacks later, use OpenRouter's `models: [primary, ...fallbacks]` in the request body.

---

## Model switcher registry empty (OpenRouter models not loading)

**Problem**: ModelSwitcher showed "Models load from OpenRouter when available. Check API key if empty" even when the API returned a full list. The dropdown never showed the OpenRouter model list.

**Cause**: The model router store's `fetchSettings` called `GET /api/model-settings` (which returns `registry` from `getOpenRouterModels()`) but only updated `activeModelId`, `mode`, `fallbackIds`, `enabledModelIds`, `manualModelId` in state. It never set `registry`, so the client kept the initial `registry: []`.

**Fix**: In `apps/studio/lib/model-router/store.ts`, in `fetchSettings`, set `registry` (and `copilotModelId`, `assistantUiModelId`) from the GET response so the UI receives the OpenRouter list and current slot values.

---

## Settings: single source of truth (tree-as-source)

**Problem:** Previously, adding a new setting required touching both (1) defaults (config/schema) and (2) section definitions (APP_SETTINGS_SECTIONS, etc.). Duplicate definitions led to drift and missing controls.

**Fix (current):** Settings use **tree-as-source**: the React tree (SettingsSection + SettingsField with `default`) is the single source. Codegen (`pnpm settings:generate`) mounts the tree, reads the registry, and writes `lib/settings/generated/defaults.ts`. Config and store use generated defaults; the panel uses only registry sections. **Do not** add keys in a hand-maintained schema or duplicate defaults; add or edit SettingsField in the tree and run codegen. See [settings-tree-as-source-and-codegen.mdx](../../architecture/settings-tree-as-source-and-codegen.mdx) and decisions.md ADR "Settings: tree-as-source and generated contract."

---

## Project switcher at editor level (avoid)

**Context**: Project context is **app-level**. The app-shell store holds `activeProjectId`; `ProjectSwitcher` lives in AppShell (editor tab bar). Dialogue and Character editors sync from app shell into their domain stores.

**Do not**: Add a project switcher or project-selection UI inside an individual editor. Use the app-level project; see [decisions.md](./decisions.md) (Project context at app level).

---

## Double-registering system actions

**Problem**: If multiple editors are mounted at once and each calls `useDomainCopilot`, the same action names (e.g. `forge_createNode`) can be registered twice, leading to undefined behavior.

**Fix**: Only the **active** editor is rendered. App Shell renders only DialogueEditor or VideoEditor, so only one system contract is active at a time.

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

**Fix**: For collection CRUD (forge-graphs, video-docs), use the Payload SDK (`lib/api-client/payload-sdk.ts`) via the TanStack Query hooks. For custom endpoints (auth, settings, AI), use the generated services or **manual client modules** in `lib/api-client/` (e.g. elevenlabs, media, workflows), or **vendor SDKs** where appropriate. Do not call `fetch` for `/api/*` from components or stores. **New endpoints:** add a manual client module in `lib/api-client/` or use a vendor SDK; the OpenAPI spec is for **documentation only** (it does not support streaming)?"do not rely on extending it to generate new clients.

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

**Fix**: (1) Use `workspace:*` for internal `@forge/*` deps in `packages/agent-engine`, `packages/shared`, and `packages/dev-kit` so `pnpm install` does not require Verdaccio. (2) Run `pnpm install --no-frozen-lockfile` from the repo root to resolve and lock all Twick packages. (3) In `apps/studio/app/globals.css`, import only `@twick/studio/dist/studio.css`; do not import `@twick/timeline/dist/timeline.css` ?" the published npm package does not ship that file (studio bundles timeline styles).

---

## Twick: useTimelineContext must be used within a TimelineProvider (VideoEditor)

**Problem**: Runtime error "useTimelineContext must be used within a TimelineProvider" when the Video editor panel is opened (stack at TwickStudio).

**Cause (historical)**: Dockview rendered panels in a way that disconnected them from the parent React tree, so app-level providers did not reach panel content.

**Fix (current)**: The Video editor is now **locked by capability** `studio.video.editor` while Dockview is restored. This avoids relying on Twick context until we re-enable Video. If we re-enable Video, either mount Twick providers inside the panel content, or validate Dockview panels stay within the React tree (avoid portal-based panel wrappers).

---

## Lost panels / Reset layout (DockLayout)

**Problem**: Users can end up with an empty content area (all panels gone). Dockview can persist a broken layout if all panels are closed or moved.

**Fix**: DockLayout uses **Dockview** and exposes a **ref with `resetLayout()`**. Call `ref.current.resetLayout()` to clear persisted layout and restore default panels (e.g. from a "Reset layout" or "Restore default layout" button in the editor toolbar or settings). Layout is stored at `localStorage['dockview-{layoutId}']`; clearing that key and remounting restores defaults.

---

## Dockview tab props leaking to DOM

**Problem**: Dockview panel header props include `containerApi` and other non-DOM fields. Spreading them onto a `<div>` triggers React warnings or invalid DOM props.

**Fix**: In `DockviewSlotTab`, destructure `containerApi` (and any Dockview-only props like `tabLocation`) before spreading the rest onto the DOM element.

---

## FlexLayout panels not showing (only overlays visible)

**Problem**: After the Dockview→FlexLayout swap, only overlay UI (e.g. app bar, modals) was visible; no Library/Main/Inspector/Workbench panels.

**Fix**: FlexLayout was removed; DockLayout is back to **Dockview**. If panels disappear, reset the Dockview layout (`resetLayout()` or clear `localStorage['dockview-{layoutId}']`) rather than reintroducing FlexLayout.

---

## MDX build error: missing frontmatter

**Problem**: `pnpm --filter @forge/studio build` failed with `[MDX] invalid frontmatter ... expected string, received undefined` for a doc under `docs/` (e.g. `docs/architecture/README.md`, `docs/how-to/27-posthog-llm-analytics.mdx`, or any `.md`/`.mdx` in the docs collection).

**Fix**: The requirement applies to **all** `.md` and `.mdx` under `docs/`: fumadocs-mdx requires YAML frontmatter with at least **`title`** (string). Add frontmatter to the failing file. Example:
```
---
title: Plan - Editor layout main content not showing
created: 2026-02-07
updated: 2026-02-08
---
```
For the ongoing convention (new or moved docs), see [standard-practices](standard-practices.md) § Docs (MDX build).

---

## Build: uncaughtException "data argument must be string or Buffer... Received undefined"

**Problem**: `pnpm --filter @forge/studio build` failed during "Creating an optimized production build" with `TypeError: The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined` (code `ERR_INVALID_ARG_TYPE`). No stack trace in output; typically from `Buffer.from(undefined)`, `fs.writeFile(path, undefined)`, or `crypto.Hash.update(undefined)`.

**Fixes applied**: (1) **api-client request.ts** — `base64(str)` now guards: if `str` is null/undefined or not a string, return empty-base64 instead of calling `Buffer.from(str)`. (2) **generate-openapi.mjs** — never pass undefined to `writeFileSync`: use `spec != null ? JSON.stringify(spec, null, 2) : '{}'`. (3) **next.config.ts SanitizeUndefinedAssetSourcePlugin** — guard `sanitizeUndefinedSources(compilation, assets)` so if `assets` is null/undefined we return immediately (avoids `Object.entries(assets)` throwing when processAssets calls the hook with undefined at some stages). Re-run build after changes; if the error persists, the source may be inside a dependency (e.g. hashing in webpack).

---

## Catalog route: where type not assignable to Payload Where

**Problem**: `pnpm --filter @forge/studio build` failed with type error in `apps/studio/app/api/catalog/route.ts` (line 22): `Type 'Record<string, unknown>' is not assignable to type 'Where'`. Payload's `find()` expects `where` to be of type `Where`; a variable typed as `Record<string, unknown>` is too loose.

**Fix**: Build the `where` object inline in the `payload.find()` call (e.g. `where: slug ? { status: { equals: 'published' }, slug: { equals: slug } } : { status: { equals: 'published' } }`) so TypeScript infers the correct type. Avoid typing query objects as `Record<string, unknown>` when passing to Payload.

---

## CSS @import must precede all rules (globals.css parse error)

**Problem**: `pnpm dev` fails with "Parsing CSS source code failed" at `globals.css` (compiled line ~1115): `@import rules must precede all rules aside from @charset and @layer statements`. The offending lines are `@import url('https://fonts.googleapis.com/...')` (Inter, JetBrains Mono, Rubik, Mulish, etc.).

**Root cause**: A dependency (almost certainly `@twick/studio/dist/studio.css` or something it pulls in) contains `@import url(...)` for Google Fonts. When `apps/studio/app/globals.css` is processed by PostCSS/Tailwind, the pipeline order produces a single CSS file where Tailwind's expanded rules appear first (~1100+ lines), then the inlined content from `@import "@twick/studio/dist/studio.css"` appears, so the font `@import` ends up after other rules. CSS requires all `@import` to be at the top.

**Attempted fix (insufficient)**: Moving all `@import` in globals.css to the very top (tw-animate, shared styles, studio) so they are "first" in the source file. This did not fix it because the Tailwind/PostCSS pipeline expands `@tailwind base/components/utilities` and merges dependency CSS in an order that still places dependency-injected `@import url()` after those rules in the final output.

**Fix**: Added a PostCSS plugin that hoists all `@import url(...)` rules to the top of the compiled CSS. See `apps/studio/scripts/postcss-hoist-import-url.cjs` and `apps/studio/postcss.config.mjs` (plugin runs after `@tailwindcss/postcss`). The config resolves the plugin with an absolute path (`path.join(__dirname, 'scripts', 'postcss-hoist-import-url.cjs')`) so Next/Turbopack can load it when PostCSS runs from `.next`. If this error reappears (e.g. after a dependency update), ensure the hoist plugin still runs after Tailwind and that it handles any new @import from the dependency.

---

## "getSnapshot should be cached" / useSyncExternalStore loop

**Problem**: Console error "The result of getSnapshot should be cached to avoid an infinite loop", often followed by "Maximum update depth exceeded". Triggered when a Zustand selector returns a **new object or array reference** every time (e.g. `state.getMergedSettings(...)` which spreads and returns a new object). React's `useSyncExternalStore` requires the snapshot to be referentially stable when state has not changed; a new reference each time is treated as a change and causes re-render ? getSnapshot again ? infinite loop.

**Fix**: Do not select merged or derived objects from the store in components. Use selectors that return **primitives or stable references** only (e.g. `(s) => s.getSettingValue('ai.agentName', ids)` with stable `ids`). Build any object needed in the component with `useMemo` from those primitive values. Optionally, the store can cache merged result per key and return the same reference when underlying data is unchanged. **Fallbacks:** If the selector uses `?? defaultValue` and `defaultValue` is an object or array, use a **module-level constant** (e.g. `EMPTY_RAIL`, `EMPTY_SECTIONS`) so the same reference is returned when the key is missing; otherwise `defaultValue` creates a new ref every call and triggers the loop (see panel-registry.ts, settings-registry.ts).

---

## Model switcher manual mode oscillation (Maximum update depth exceeded)

**Problem**: Selecting **Manual (pick one)** in ModelSwitcher caused the model router `mode` to flip between `auto` and `manual`, creating a rapid `store.setState` loop and React "Maximum update depth exceeded". The bidirectional sync between `ai.model` (settings) and the model-router store let router-driven changes trigger the settings ? router effect, which forced the mode back to auto before settings could update.

**Fix**: Make the settings ? router sync run **only when the app setting changes** (read current router state via `useModelRouterStore.getState()`), and keep the router ? settings sync to reflect router changes. This prevents router-driven updates from re-triggering the settings sync and eliminates the oscillation.

---

## "Maximum update depth exceeded" — Radix composeRefs hypothesis (FALSE POSITIVE)

**Context**: Error surfaces at Radix UI `setRef` / `ScrollAreaPrimitive.Root` / `EditorTooltip` in the stack. External reports (Radix #3799) cite composeRefs + React 19 as cause.

**FALSE POSITIVE in this codebase**: The user explicitly confirmed that (a) Radix tooltip was **not** the cause — stripping tooltips did not fix the error; (b) Radix ScrollArea / replacing with native overflow is **forbidden** — "absolutely not"; (c) the composeRefs hypothesis was wrong for this repo. Many projects use Radix without issue.

**Do not**: Replace Radix ScrollArea, Tooltip, or other primitives with native alternatives based solely on the composeRefs hypothesis. Do not assume stack-trace location equals root cause.

**Actual cause**: Under investigation. See "Maximum update depth — panel/slot cascade" for attempted fixes. Tooltip strip and native-title migration remain for other reasons; Radix primitives stay in packages/ui.

---

## Maximum update depth — panel registration and slot store cascade

**Problem**: "Maximum update depth exceeded" in EditorInspector / EditorDockPanel / ScrollArea path (Dialogue and Character editors). The panel registration cascade (EditorRail → setRailPanels → EditorLayout → setSlots → SlotPanel) may contribute.

**Attempted fix (reverted)**: Deferring setRailPanels/setSlots via requestAnimationFrame caused graph panels to stop rendering (black/empty). rAF deferral reverted.

**Fix (slotIdsKey + shallow compare)**: Guard the `setSlots` effect in DockLayout so we only call `useSlotContentStore.getState().setSlots(resolvedSlots)` when the slots actually changed. Use a `prevSlotsRef` and compare keys + slot content by reference; skip if identical. Add `slotIdsKey = Object.keys(resolvedSlots).sort().join('|')` for effect stability. Do **not** remove `resolvedSlots` from the effect deps entirely—that caused main/right/bottom panels to not render while left worked (effect ran before all rails had populated or ran too rarely).

**Anti-pattern (left-only render)**: When the setSlots effect was changed to run only on `slotIdsKey` (and not `resolvedSlots`), the effect could run before all rails had populated, so only left was synced. Always ensure the effect runs with the complete resolvedSlots when structure or content changes.

**Layout JSON migration**: When using rails (`rightPanels` etc.), saved layouts with legacy `right-inspector` / `right-settings` panel ids are incompatible. DockLayout skips loading such layouts and falls through to `buildDefaultLayout`.

**Forbidden fix**: Do **not** replace Radix ScrollArea with native overflow. User explicitly forbade this; the Radix hypothesis is a false positive.

**Current state**: Synchronous setRailPanels and setSlots; setSlots guarded by shallow compare. If error recurs, try: (1) memoize panel content so descriptors have stable refs; (2) batch store updates; (3) audit selectors for unstable refs. Do not blame Radix or replace ScrollArea.

---

## Wide form dialogs + left-side close button regression

**Problem**: Character/create upsert dialogs rendered too wide (near edge-to-edge) for simple forms, with low visual hierarchy and inconsistent close placement (left-side close icon). This reduced readability and made the UI feel unpolished.

**Cause**: Overlay surfaces used broad width presets and did not enforce a consistent close-position contract. Some dialogs bypassed shadcn form section patterns and lacked tokenized spacing.

**Fix**: Standardize overlay/dialog sizing and close placement:

- `EditorOverlaySurface` size mapping is compact by default (`sm -> max-w-md`, `md -> max-w-xl`, `lg -> max-w-2xl`).
- `full` remains constrained (`min(94vw, 72rem)`) with max-height cap; never edge-to-edge for standard forms.
- Close button is icon-only and top-right for all dialogs.
- Upsert forms use shadcn `Form` primitives plus section layout with tokenized spacing.

References: `packages/shared/src/shared/components/editor/EditorOverlaySurface.tsx`, `packages/ui/src/components/ui/dialog.tsx`, `apps/studio/components/character/CreateCharacterModal.tsx`, and [styling-and-ui-consistency.md](./styling-and-ui-consistency.md).

---

## Copilot sidebar closes when selecting a model

**Problem**: Selecting a model from the ModelSwitcher inside the Copilot sidebar caused the sidebar to close immediately.

**Cause**: The model picker popover was portaled to `document.body` (Radix Popover default). CopilotKit renders the sidebar as a Dialog; clicking inside a portaled popover is treated as an "outside click" and closes the dialog.

**Fix**: Add a `portalled` option to `@forge/ui/popover` and set `portalled={false}` for ModelSwitcher in the `composer` variant (Copilot sidebar / assistant-ui). Keep the portal for toolbar usage so popovers can escape overflow when not inside a dialog.

---

## Cmd+K assistant popup: no model switcher + stale model ID ("No endpoints found")

**Problem**: Global assistant chat opened from Cmd+K had no in-composer model switcher, so users could not recover when the selected model became invalid. Requests failed with OpenRouter `"No endpoints found for google/gemini-2.0-flash-exp:free"`.

**Cause**: (1) `DialogueAssistantPanel` did not expose composer slot props to `Thread`, so `AssistantChatPopup` could not inject `ModelSwitcher`. (2) Legacy persisted model IDs were still read as-is, and the old default (`google/gemini-2.0-flash-exp:free`) could be unavailable.

**Fix**: (1) Forward `composerLeading` / `composerTrailing` through `DialogueAssistantPanel` to `Thread` and mount `ModelSwitcher provider="assistantUi" variant="composer"` in `AssistantChatPopup`. (2) Move default chat model to `openai/gpt-oss-120b:free`, normalize legacy unavailable IDs in persistence, and resolve selected model against the current OpenRouter registry before use (`resolveModelIdFromRegistry`) in `/api/model-settings`, `/api/assistant-chat`, and Copilot runtime resolver.

---

## MdxBody type error when using body as JSX component

**Problem**: In `apps/studio/app/docs/[[...slug]]/page.tsx`, `body` from `page.data` is narrowed to `body` when `typeof body === 'function'`, but TypeScript infers that as a generic `Function`. JSX requires a construct/call signature (e.g. `React.ComponentType`), so `<MdxBody components={mdxComponents} />` fails type-check.

**Fix**: Cast `body` to a React component type when assigning: `(typeof body === 'function' ? body : null) as React.ComponentType<{ components: typeof mdxComponents }> | null`. Keep the existing render: `{MdxBody ? <MdxBody components={mdxComponents} /> : null}`.

---

## Payload SQLite CANTOPEN (error 14) when opening /admin or creating project

**Problem**: `Error: cannot connect to SQLite: ConnectionFailed("Unable to open connection to local database ./data/payload.db: 14")` when visiting `/admin` or doing any Payload operation. SQLite error 14 is `SQLITE_CANTOPEN` (unable to open the database file).

**Cause**: The default DB URL was `file:./data/payload.db`, which is resolved relative to the **process cwd**. When running `pnpm dev` from the repo root, cwd is the root, so the path pointed at `./data/payload.db` under the root; that directory often doesn't exist, or the path is wrong when Next runs from a different working directory.

**Fix**: In `apps/studio/payload.config.ts`, the default DB path is now resolved relative to the config file: `path.join(dirname, 'data', 'payload.db')`, and the URL is built with `pathToFileURL(...).href` so libsql receives a valid absolute file URL. The config also ensures `apps/studio/data` exists with `fs.mkdirSync(dataDir, { recursive: true })` when `DATABASE_URI` is not set. To use a custom path, set `DATABASE_URI` in `.env` (e.g. `file:./data/payload.db` for a path relative to cwd, or an absolute path).

---

## Payload DB: pathToFileURL not defined + DATABASE_URI only in .env.example

**Problem**: `ReferenceError: pathToFileURL is not defined` at `payload.config.ts` when hitting e.g. `/api/projects`. Payload could not connect to the database.

**Causes**: (1) `pathToFileURL` was used in the config but never imported (only `fileURLToPath` was imported from `'url'`). (2) Agents had only updated `.env.example` with `DATABASE_URI`; the actual secret files (`.env`, `.env.local`) were not updated, so `DATABASE_URI` was empty at runtime. The code then fell back to the default path and tried to call `pathToFileURL(defaultDbPath).href`, which threw.

**Fix**: (1) In `payload.config.ts`, import `pathToFileURL` from `'url'`: `import { fileURLToPath, pathToFileURL } from 'url'`. (2) When adding or changing env vars that affect runtime (e.g. `DATABASE_URI`), **update both** `.env.example` (documentation) **and** the real env files (`.env` or `.env.local`) so the app has a valid value. If you leave `DATABASE_URI` unset on purpose, the default local SQLite path is used and requires the `pathToFileURL` import to build a valid file URL.

---

## BuiltInAgent / OpenRouter SDK incompatibility

**Problem**: Using `@openrouter/ai-sdk-provider` (e.g. `createOpenRouter`) for the CopilotKit agent causes interface mismatch. CopilotKit expects `openai` for the adapter and `@ai-sdk/openai` for BuiltInAgent; the OpenRouter provider uses a different shape. We swapped runtimes multiple times trying to use the OpenRouter SDK.

**Fix**: Do **not** use `@openrouter/ai-sdk-provider` for the CopilotKit route or for `createForgeCopilotRuntime` in shared. Use **OpenAI** (`openai` package) with `baseURL: config.baseUrl` and **createOpenAI** from `@ai-sdk/openai` with the same baseURL. Model fallbacks are implemented via a custom fetch that injects `models: [primary, ...fallbacks]` into the request body (see [openrouter-fetch.ts](../../apps/studio/lib/model-router/openrouter-fetch.ts)). Reference: [06-model-routing-and-openrouter.mdx](../../architecture/06-model-routing-and-openrouter.mdx).

---

## Verdaccio `npm adduser` 409 Conflict / access denied

**Problem**: `npm adduser --registry http://localhost:4873` returns `E409 Conflict` with "bad username/password, access denied".

**Cause**: The username already exists in `verdaccio/storage/htpasswd` (local registry auth file) and the password does not match.

**Fix**: Either log in with the existing user:

```bash
npm login --registry http://localhost:4873 --auth-type=legacy
```

Or reset the user by deleting `verdaccio/storage/htpasswd`, restarting Verdaccio, and re-adding the user:

```bash
rm -f verdaccio/storage/htpasswd
pnpm registry:start
npm adduser --registry http://localhost:4873 --auth-type=legacy
```

**Note**: Even with `publish: $all`, npm expects auth for scoped publishes; log in once (or use `npm-cli-login`) before running publish scripts.

---

## Forge publish pipeline failures (DTS + Verdaccio)

**Problem**: `pnpm registry:forge:build` failed in `@forge/shared` DTS build with React `ref` type conflicts and tool-ui `<style jsx>` props, then `@forge/agent-engine` / `@forge/dev-kit` DTS builds failed to resolve `@forge/*` packages. Publishing failed because `npm publish packages/ui` was interpreted as a GitHub repo (`packages/ui`), and Verdaccio required auth.

**Fix**:

- **React types**: enforce a single `@types/react` + `@types/react-dom` via root `pnpm.overrides`.
- **Markdown component props**: strip `ref` before spreading props in `markdown-text.tsx` to avoid cross-react-type conflicts.
- **Tool UI CSS**: replace `<style jsx global>` with a plain `<style>` using `dangerouslySetInnerHTML`.
- **DTS resolution**: add `tsconfig.json` with `moduleResolution: "bundler"` to `packages/agent-engine` and `packages/dev-kit`.
- **Dev-kit exports**: avoid duplicate exports by namespacing UI (`export * as ui from '@forge/ui'`).
- **Publish scripts**: prefix publish paths with `./` so npm treats them as local directories.
- **Verdaccio auth**: add `auth.htpasswd` config and log in once (or use `pnpm dlx npm-cli-login`) before publish.

---

## CopilotKit BuiltInAgent fails on OpenRouter v3 responses

**Problem**: `AI_UnsupportedModelVersionError` when CopilotKit BuiltInAgent runs with OpenRouter models like `google/gemini-2.0-flash-exp:free`. AI SDK 5 responses API only supports spec v2, but some OpenRouter-backed providers return v3.

**Cause**: BuiltInAgent uses the OpenAI **responses** API by default. Models that return v3 responses (Gemini, Claude) are incompatible and crash.

**Fix**:
- Add responses‑compatibility metadata to the model registry (`supportsResponsesV2`).
- Filter CopilotKit model selection to responses‑v2 compatible models, with a safe fallback (e.g. `openai/gpt-4o-mini`).
- Keep assistant‑ui chat on the **chat** pipeline so it can use a broader set of models.

---

## createForgeCopilotRuntime import path (server vs client)

**Problem**: `/api/copilotkit` failed with `TypeError: createForgeCopilotRuntime is not a function` when imported from `@forge/shared/copilot/next`.

**Cause**: `@forge/shared/copilot/next` exports **client-only** provider APIs; the runtime factory lives in `@forge/shared/copilot/next/runtime`.

**Fix**: Import `createForgeCopilotRuntime` from `@forge/shared/copilot/next/runtime` in server routes (`apps/studio/app/api/copilotkit/handler.ts` and any consumer API routes).

---

## CopilotKit runtime sync: Agent "default" not found

**Problem**: `useAgent: Agent 'default' not found after runtime sync (runtimeUrl=/api/copilotkit). No agents registered.`

**Cause**: Only `POST /api/copilotkit` existed. CopilotKit syncs agents via `GET /api/copilotkit/info` (and sometimes `/api/copilotkit/agents__unsafe_dev_only`). Without those routes, the client sees no agents.

**Fix**: Add a catch-all route `apps/studio/app/api/copilotkit/[...path]/route.ts` and export `GET` for `/api/copilotkit` so the runtime handler serves `/info` and dev-only endpoints. Share the handler via `apps/studio/app/api/copilotkit/handler.ts`.

**Note:** If the handler throws before returning (e.g. `ReferenceError: log is not defined` in resolveModel), the client will also see "No agents registered" because GET /info never gets a successful response. Ensure the handler does not throw on request (e.g. define logger; validate env at module load).

---

## CopilotKit handler: ReferenceError log is not defined

**Problem**: `ReferenceError: log is not defined` at `handler.ts:35` (resolveModel). POST /api/copilotkit returns 500.

**Cause**: resolveModel used `log.info(...)` without importing or defining `log`. Studio uses structured logging via `getLogger` from `@/lib/logger`.

**Fix**: In `apps/studio/app/api/copilotkit/handler.ts`, add `import { getLogger } from '@/lib/logger';` and `const log = getLogger('copilotkit');`. Do not use ad-hoc `console` for API/routing; use the Studio logger per the existing "Logging: use Studio logger" guidance in this file.

---

## Model switcher errors and excess CopilotKit/Studio calls on load (planned work)

**Problem**: Model switcher is producing many errors; Studio and CopilotKit make too many calls on app load. Related: registry hydration, settings ⇄ router sync (see "Model switcher registry empty" and "Model switcher manual mode oscillation" in this file).

**Planned work**: (0) **AI agent and model provider plan** — discuss/document single source of truth, who provides models, avoid duplicate fetches and sync loops. (1) **Model switcher stability** — single source of truth, registry hydrated once, no oscillation. (2) **Reduce CopilotKit/Studio calls on load** — fewer calls, defer/batch, single init path. See [STATUS § Next](./STATUS.md) and initiative `model-routing-copilotkit-stability` in [task-registry](./task-registry.md). Architecture: [06-model-routing-and-openrouter.mdx](../../architecture/06-model-routing-and-openrouter.mdx).

---

## Single CopilotKit runtime and model router (no root duplicate)

**Do not** add a second CopilotKit runtime or model router at repo root. The **single** runtime and model router (server-state, registry, openrouter-config, responses-compat) live **only** in `apps/studio`. Root `app/api/copilotkit` and root `lib/openrouter-config` + `lib/model-router` were removed; all API routes in use are under `apps/studio/app/api/`. See [06-model-routing-and-openrouter.mdx](../../architecture/06-model-routing-and-openrouter.mdx).

---

## Drawer requires DialogTitle (Workbench)

**Problem**: Opening the Dialogue workbench triggered `DialogContent requires a DialogTitle` from Radix/vaul.

**Cause**: `DrawerContent` rendered without a `DrawerTitle`, which Radix requires for accessibility.

**Fix**: Add `<DrawerTitle className="sr-only">Workbench</DrawerTitle>` inside the drawer content (DialogueEditor). Use `DrawerTitle` (not a plain `<div>`) so Radix can detect it.

---

## Settings / Workbench drawer or sheet not opening when clicked

**Problem**: Clicking Settings (app bar or editor toolbar) or Workbench (Dialogue editor) did not open the Sheet or Drawer; panels appeared not to respond.

**Cause**: Stacking order: CopilotKit sidebar and other UI (e.g. Dockview) use z-index 30–50. Our Sheet and Drawer used z-50 / z-100 and could render behind another layer or a floating layer could capture clicks before they reached the buttons.

**Fix**: (1) Raise overlay z-index for Sheet, Drawer, and DropdownMenu in `packages/ui`: use `z-[200]` for overlay and content so they sit above CopilotKit and Dockview. (2) In `apps/studio/app/globals.css`, add `.copilotKitSidebar { z-index: 20; }` so the CopilotKit sidebar stays below our overlays. (3) Ensure DropdownMenuContent (editor Settings menu) uses the same z-[200]. See [styling-and-ui-consistency.md](./styling-and-ui-consistency.md) for UI debugging.

---

*(Add new entries when new errors are found and fixed.)*

