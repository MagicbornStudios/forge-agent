# Command Policy

RepoStudio command execution is safe-by-default and loop-oriented:

- allowlist only
- explicit confirmation required (`confirm` checkbox in UI, `--confirm` in CLI)
- deny patterns block destructive fragments
- command IDs can be locally disabled/enabled in UI and persisted per machine
- allowlisted terminal execution only (no arbitrary shell path in v1.5)

Default sources:

- root `package.json` scripts
- workspace package scripts from `pnpm-workspace.yaml`
- forge built-ins (`forge-loop:*`, `forge-env:*`, `forge-repo-studio:*`)

Config files:

- shared policy: `.repo-studio/config.json`
- local overrides: `.repo-studio/local.overrides.json` (gitignored)

Use `forge-repo-studio run <command-id> --confirm` for CLI execution with the same policy rules.

Runtime safety commands:

- `forge-repo-studio status`
- `forge-repo-studio stop`
