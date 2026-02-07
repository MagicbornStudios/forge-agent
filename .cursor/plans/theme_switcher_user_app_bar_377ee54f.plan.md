---
name: Theme switcher user app bar
overview: Add a top-level theme switcher (persisted via user settings), show the logged-in user in the app bar, improve dropdown/menu padding via base theme tokens, and align the app bar with "data and platform" (project, identity, theme, settings). Optionally scope settings by user so theme is truly per-user.
todos: []
isProject: false
---

# Theme switcher, user in app bar, and base menu/dropdown polish

## Current state

- **Theme**: Driven by `ui.theme` in settings store; [AppThemeProvider](apps/studio/components/providers/AppThemeProvider.tsx) reads it and applies `data-theme` via next-themes. Theme options exist in [ai-settings](apps/studio/components/settings/ai-settings.tsx) but there is **no visible theme switcher** in the app bar—only inside the Settings sheet.
- **Settings persistence**: [GET/POST /api/settings](apps/studio/app/api/settings/route.ts) read/write [settings-overrides](apps/studio/payload/collections/settings-overrides.ts). The collection has **no user relation**; overrides are keyed only by `scope` + `scopeId`, so all users share the same app/editor overrides today.
- **Current user**: [useMe](apps/studio/lib/data/hooks/use-me.ts) and [GET /api/me](apps/studio/app/api/me/route.ts) return `{ user: { id, email, name, role, plan } }`. Used by EntitlementsProvider; **not** shown in the app UI.
- **Dropdown menus**: [packages/ui dropdown-menu.tsx](packages/ui/src/components/ui/dropdown-menu.tsx) uses fixed `px-2 py-1.5` for items and `p-1` for content—no tokens, so menus feel tight and inconsistent with the rest of the theming system.
- **App bar**: [AppShell](apps/studio/components/AppShell.tsx) tab bar has: ProjectSwitcher, + Editor buttons, SettingsMenu. No theme control, no user representation.

## 1. Base theme and dropdown/menu padding

**Goal:** Fix “dropdown menu items lacked padding” at the source so all dropdowns (File/View/State, Settings, ProjectSwitcher, future Theme/User menus) get consistent, token-driven padding.

- In [packages/shared/src/shared/styles/themes.css](packages/shared/src/shared/styles/themes.css): add **menu-specific tokens** in the compact (default) and comfortable blocks, e.g.:
  - `--menu-item-padding-x`, `--menu-item-padding-y` (e.g. `0.5rem` / `0.375rem` for compact so items have more “luster” than current `px-2 py-1.5`).
  - Optionally `--menu-content-padding` for the dropdown content (replace hardcoded `p-1`).
- In [packages/ui/src/components/ui/dropdown-menu.tsx](packages/ui/src/components/ui/dropdown-menu.tsx):
  - Use these tokens (via Tailwind arbitrary values or a small shared menu class) for `DropdownMenuItem`, `DropdownMenuSubTrigger`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, and `DropdownMenuContent` so padding and spacing are driven by the theme.
- Document in [docs/design/01-styling-and-theming.mdx](docs/design/01-styling-and-theming.mdx) that menu/dropdown padding uses `--menu-item-padding-*` and `--menu-content-padding`.

This gives a single place to tune “menu luster” and keeps the theming system coherent.

## 2. Theme switcher in the app bar

**Goal:** A visible theme switcher at top level so you can test themes without opening Settings; selection persisted via the existing settings API.

- **New component** (e.g. `apps/studio/components/app-bar/ThemeSwitcher.tsx` or next to Settings): dropdown listing the same themes as [AppThemeProvider](apps/studio/components/providers/AppThemeProvider.tsx) (`APP_THEMES` / themeOptions). Current theme from `useSettingsStore(s => s.getSettingValue('ui.theme'))`.
- **On select:**
  1. `setSetting('app', 'ui.theme', value)` so the UI updates immediately (AppThemeProvider already reacts to the store).
  2. Persist app overrides: call `SettingsService.postApiSettings({ scope: 'app', scopeId: null, settings: getOverridesForScope('app') })` so the choice is saved without opening the Settings sheet. Optionally show a brief toast (“Theme saved”) or fail silently with toast on error.
- **Placement:** In [AppShell](apps/studio/components/AppShell.tsx) tab bar `actions`, e.g. after the editor buttons and before Settings (or between Project and Editors, depending on desired “data vs platform” order). Use a compact trigger (e.g. icon + label “Theme” or just icon with tooltip) to avoid clutter.
- **Persistence note:** Today settings-overrides is global (no user). So “saved in user settings” means “saved in app settings that persist across reloads.” If you want true per-user theme later, that’s Phase 2 (see below).

## 3. Current user in the app bar

**Goal:** Show who is logged in (for you: admin); represent the user so the app bar is tied to “data and platform” (identity + project + theme + settings).

- **New component** (e.g. `apps/studio/components/app-bar/AppBarUser.tsx`): uses `useMe()` from [lib/data/hooks](apps/studio/lib/data/hooks/use-me.ts).
  - **When `user` is present:** show a small avatar (or initial letter from name/email) and display name or email (e.g. “Admin” or `user.name ?? user.email`). Can be a button that opens a dropdown: “Signed in as …”, optional “Account” / “Sign out” (if you have routes for those later).
  - **When `user` is null (not logged in):** show “Not signed in” or “Sign in” so it’s clear there is no authenticated user. For “for now just me the admin”: ensure the seeded admin is the one you use when testing; the component just displays whatever `/api/me` returns.
- **Placement:** In AppShell tab bar, right side: e.g. `… | ThemeSwitcher | AppBarUser | SettingsMenu`. This keeps project + editors on the left (data/work), theme + user + settings on the right (platform/identity).

No auth flow changes required for “show current user”; only UI that consumes existing `useMe()`.

## 4. App bar as “data and platform”

- In [AppShell](apps/studio/components/AppShell.tsx), order and group the tab bar actions so the intent is clear:
  - **Data / work:** ProjectSwitcher, then + Dialogue / + Video / + Character / + Strategy.
  - **Platform / identity:** ThemeSwitcher, AppBarUser, SettingsMenu.
- Optionally add a visual separator (e.g. `EditorToolbar.Separator`) between “editors” and “theme” so the bar reads as: project + editors | theme + user + settings.
- Short note in [docs/design/01-styling-and-theming.mdx](docs/design/01-styling-and-theming.mdx) or [docs/architecture/02-workspace-editor-architecture.mdx](docs/architecture/02-workspace-editor-architecture.mdx): app bar is for project context, editor access, theme, current user, and app settings.

## 5. (Optional) User-scoped settings so theme is “user settings”

**Goal:** So that “saved in user settings” is literally per-user (e.g. each user has their own theme).

- Add an optional **user** relationship (relationTo: `users`) to [settings-overrides](apps/studio/payload/collections/settings-overrides.ts). When present, the override is “owned” by that user.
- In [GET /api/settings](apps/studio/app/api/settings/route.ts): if the request is authenticated, filter `where: { user: { equals: currentUser.id } }` (and optionally `user: null` for legacy global overrides) so hydration only loads that user’s overrides.
- In [POST /api/settings](apps/studio/app/api/settings/route.ts): when creating/updating, set `user: currentUser?.id ?? null` when authenticated so new saves are user-scoped. Migration: existing overrides stay global (`user: null`); new saves from logged-in users get their id.
- **Payload types:** run `pnpm payload:types` after changing the collection so `SettingsOverrideRecord` includes `user`.
- **Store/hydration:** [settings store](apps/studio/lib/settings/store.ts) and [SettingsHydration](apps/studio/app/layout.tsx or equivalent) already merge overrides from the API; no change needed if the API returns only the current user’s overrides when logged in.

This is the only place that needs change to make theme (and all app/editor overrides) truly per-user. You can ship the theme switcher and user display first, then add user-scoping in a follow-up.

## 6. Docs and agent artifacts

- **STATUS.md:** Under “What changed (recent)”, add a line: theme switcher in app bar (persisted via settings); current user shown in app bar; dropdown/menu padding via theme tokens; optional user-scoped settings.
- **decisions.md:** If you add user-scoped settings, add a short ADR: “Settings overrides can be scoped by user; when authenticated, GET/POST filter by user so theme and other app/editor settings are per-user.”
- **design/01-styling-and-theming.mdx:** Document `--menu-item-padding-*` and that dropdowns use theme tokens; document app bar layout (project, editors, theme, user, settings).

## File summary


| Area                            | Action                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Base theme / menus              | Add `--menu-item-padding-*` and `--menu-content-padding` in themes.css (compact + comfortable). Use them in packages/ui dropdown-menu.tsx for Item, SubTrigger, Content. |
| Theme switcher                  | New ThemeSwitcher component; on select set app ui.theme + POST app overrides; add to AppShell actions.                                                                   |
| User in app bar                 | New AppBarUser component using useMe(); show name/email or “Not signed in”; add to AppShell actions.                                                                     |
| App bar layout                  | Order and optionally separate Project+Editors                                                                                                                            |
| User-scoped settings (optional) | Add user to settings-overrides; filter GET/POST by current user; regenerate types.                                                                                       |
| Docs                            | 01-styling-and-theming, 02-workspace-editor-architecture, STATUS, decisions.                                                                                             |


## Order of work

1. **Menu tokens + dropdown padding** — So all menus improve in one go and the theme switcher / user dropdown look good from day one.
2. **ThemeSwitcher component + AppShell** — Visible theme change and persist on select.
3. **AppBarUser component + AppShell** — Show current user (or “Not signed in”).
4. **App bar grouping/separator** — Optional but quick.
5. **User-scoped settings** — Optional follow-up; implement if you want theme (and all settings) per-user.
6. **Docs** — Update design and STATUS/decisions.

## Why theming felt slow

The codebase **does** have a clear theming system: semantic tokens and theme variants in [themes.css](packages/shared/src/shared/styles/themes.css), `data-theme` and `data-density`, and settings-driven theme in AppThemeProvider. What was missing was:

- **No quick way to try themes** — Theme lived only in the Settings sheet, so testing required opening Settings and saving. A top-level theme switcher fixes that.
- **Menus not using tokens** — Dropdowns used hardcoded `px-2 py-1.5` instead of theme-driven padding, so they didn’t benefit from the same “one place to tune” as the rest of the UI. Moving to tokens (and slightly more generous defaults) gives consistent “luster” and one place to adjust in the future.

After this plan, you keep the same theme system but add a visible switcher and token-based menus so iteration and testing are faster.