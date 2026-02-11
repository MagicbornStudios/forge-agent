---
name: Strip tooltips from Studio
overview: Remove all Radix tooltip usage from Studio and the shared editor/assistant-ui components it uses. Keep base Radix tooltip primitives in packages/ui for Platform and future use, but ensure Studio's render tree never includes them. Use native `title` only where a simple hint is still desired.
todos: []
isProject: false
---

# Strip tooltips from Studio

## Scope

**In scope:** Studio app and the shared package components that Studio renders (editor components, assistant-ui for Chat panel). **Out of scope:** Platform app, packages/ui internals, tool-ui data-table.

## Usage map


| Location                                    | Current behavior                                                     | After change                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **packages/shared EditorButton**            | Uses EditorTooltip (Radix) when `tooltip` and not `useNativeTooltip` | Use native `title` only; remove EditorTooltip branch                             |
| **packages/shared EditorTab**               | Wraps tab in EditorTooltip when `tooltip` provided                   | Drop EditorTooltip wrapper; use native `title` on tab div when tooltip is string |
| **packages/shared TooltipIconButton**       | Radix Tooltip + TooltipTrigger asChild                               | Use native `title` on Button                                                     |
| **packages/shared assistant-ui attachment** | Radix Tooltip for tile + TooltipIconButton                           | Use native `title` on tile div; TooltipIconButton already fixed                  |
| **packages/shared EditorTooltip**           | Wraps children in Radix Tooltip                                      | Keep file; no consumers after changes                                            |
| **packages/shared tool-ui data-table**      | Radix Tooltip for column headers                                     | Leave as-is (not used by Studio; Strategy/docs only)                             |
| **packages/ui**                             | tooltip.tsx, tooltip-button.tsx, sidebar SidebarMenuButton           | Unchanged; Platform uses these                                                   |
| **apps/studio**                             | Passes tooltip/closeTooltip to EditorButton, EditorTab               | Remove these props at call sites                                                 |


## Phase 1: Shared components — remove Radix tooltip usage

### 1.1 EditorButton ([packages/shared/.../EditorButton.tsx](packages/shared/src/shared/components/editor/EditorButton.tsx))

- Remove `EditorTooltip` import and usage
- Remove `useNativeTooltip`, `tooltipSide`, `tooltipAlign`, `tooltipClassName` props
- When `tooltip` is a string: set `title={tooltip}` on Button
- When `tooltip` is ReactNode or `tooltipDisabled`: no tooltip
- Simplify: `tooltip?: string` only; always use `title` when provided

### 1.2 EditorTab ([packages/shared/.../EditorTab.tsx](packages/shared/src/shared/components/editor/EditorTab.tsx))

- Remove `EditorTooltip` import and wrapper
- When `tooltip` is a string: add `title={tooltip}` to the tab root div
- Remove `tooltipSide`, `tooltipAlign`, `tooltipClassName`
- Close button already uses native `title`

### 1.3 TooltipIconButton ([packages/shared/.../tooltip-icon-button.tsx](packages/shared/src/shared/components/assistant-ui/tooltip-icon-button.tsx))

- Remove `Tooltip`, `TooltipContent`, `TooltipTrigger` imports
- Use `title={tooltip}` on the Button
- Keep `side` as optional/unused for future; or remove

### 1.4 assistant-ui attachment ([packages/shared/.../attachment.tsx](packages/shared/src/shared/components/assistant-ui/attachment.tsx))

- Remove Radix `Tooltip` wrapper around attachment tile
- Add `title` to the tile div using `AttachmentPrimitive.Name` — render name into a ref/state for title, or use a simple fallback like `typeLabel`
- `TooltipIconButton` usages (Remove, Add Attachment) fixed by 1.3

## Phase 2: Studio — remove tooltip props

### 2.1 Studio.tsx ([apps/studio/components/Studio.tsx](apps/studio/components/Studio.tsx))

- Remove `tooltip` from both `EditorButton` calls (lines ~205, 216)
- Remove `tooltip` and `closeTooltip` from `StudioApp.Tab` (lines ~249–250)

### 2.2 DialogueEditor.tsx ([apps/studio/.../DialogueEditor.tsx](apps/studio/components/editors/DialogueEditor.tsx))

- Remove `tooltip` and `useNativeTooltip` from header link `EditorToolbar.Button` (lines ~1156–1158)
- Remove `tooltip` from ForgeGraphList `toolbarActions` (line ~181)

### 2.3 CharacterEditor.tsx ([apps/studio/.../CharacterEditor.tsx](apps/studio/components/editors/CharacterEditor.tsx))

- Remove `tooltip="Add a new character"` (or equivalent) from the create button

### 2.4 AppBarUser.tsx, ThemeSwitcher.tsx, ModelSwitcher.tsx

- Remove `tooltip` from `EditorButton` / trigger components

### 2.5 SectionHeader toolbarActions

- SectionHeader already uses native `title`; keep `tooltip` on actions for that. No change if EditorButton will use it as `title`; otherwise drop `tooltip` from the action type and call sites.

## Phase 3: Docs

- **standard-practices.md** — Update Tooltips section: Studio does not use tooltips for now; shared editor components use native `title` only. Add tooltips back when Radix fix is available.
- **errors-and-attempts.md** — Note that we stripped tooltips from Studio to avoid loops; add back when Radix ships fix.
- **styling-and-ui-consistency.md** — Rule 25: Studio uses no Radix tooltips; native `title` only.
- **STATUS.md** — Ralph Wiggum entry for this change.

## Concerns

1. **EditorTooltip** — Will have no Studio consumers. Keep it for possible future use; shared package still exports it.
2. **packages/ui sidebar** — `SidebarMenuButton` uses Radix when collapsed. Studio does not use `SidebarMenuButton` with tooltip (custom Settings sidebar content). No change for Studio.
3. **Platform** — Continues to use Radix tooltips (sidebar, infobar). No changes.
4. **tool-ui data-table** — Uses Radix for column headers. Not in Studio’s path; leave as-is.
5. **Root app TooltipProvider** — `app/page.tsx` (if it’s the Studio entry) may wrap with `TooltipProvider`. With no Radix tooltips in Studio, provider is effectively unused. Optional: remove from Studio’s root if present.

## Order of work

1. Phase 1.1–1.4: Change shared components
2. Phase 2.1–2.5: Remove tooltip props from Studio
3. Phase 3: Docs and STATUS

