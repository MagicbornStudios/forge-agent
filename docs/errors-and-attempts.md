# Errors and attempts (do not repeat)

Log of known failures and fixes so agents and developers avoid repeating the same mistakes.

---

## Styling: theme variables overridden by globals

**Problem**: Semantic tokens (`--background`, `--foreground`, etc.) were defined in both `src/shared/styles/themes.css` (via `--color-df-*`) and `app/globals.css` (`:root` / `.dark` with raw oklch). Import order caused globals to override the theme.

**Fix**: Removed the duplicate `:root` and `.dark` blocks from `app/globals.css`. Themes.css is the single source for semantic tokens. Set default theme with `data-theme="dark-fantasy"` on `<html>` in `app/layout.tsx`.

---

## Model 429 / 5xx and cooldown

**Problem**: Repeated requests to a rate-limited or failing model can exhaust the provider.

**Fix**: Model router records errors via `reportModelError(modelId)` in the CopilotKit route on 429/5xx. Auto-switch excludes models in cooldown (exponential backoff: 15s -> 30s -> 60s -> ... up to 5 min). Success clears cooldown via `reportModelSuccess(modelId)`.

---

## Double-registering domain actions

**Problem**: If multiple workspaces are mounted at once and each calls `useDomainCopilot`, the same action names (e.g. `forge_createNode`) can be registered twice, leading to undefined behavior.

**Fix**: Only the **active** workspace is rendered. App Shell renders either ForgeWorkspace or VideoWorkspace, so only one domain contract is active at a time.

---

*(Add new entries when new errors are found and fixed.)*
