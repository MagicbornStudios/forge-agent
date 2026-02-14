# @forge/repo-studio

RepoStudio is the loop console for running Forge Loop continuously across planning, env readiness, command execution, docs, and assistant operations.

It is designed to be used with `@forge/forge-loop` and `@forge/forge-env`:

- `.planning/` stays canonical (Forge Loop source of truth)
- Env/headless readiness is checked through `forge-env`
- Commands run through allowlist + confirm policy
- RepoStudio keeps loop status and next actions visible at all times

## Start Here

1. Run loop status first:

```bash
forge-loop progress
```

2. Launch RepoStudio:

```bash
forge-repo-studio open --view planning --mode headless --profile forge-loop
```

In this monorepo (`forge-agent`):

```bash
pnpm forge-repo-studio open --view planning --mode local --profile forge-agent
```

After publish:

```bash
npx @forge/repo-studio open --view planning --mode headless
```

## Commands

- `forge-repo-studio open [--profile ...] [--mode ...] [--view planning|env|commands|docs|loop-assistant|codex-assistant|diff] [--port ...] [--app-runtime|--package-runtime] [--reuse|--no-reuse] [--detach|--foreground] [--legacy-ui]`
- `forge-repo-studio doctor`
- `forge-repo-studio commands-list`
- `forge-repo-studio commands-toggle <command-id> [--enable|--disable]`
- `forge-repo-studio commands-view [--query ...] [--source ...] [--status ...] [--tab ...] [--sort ...]`
- `forge-repo-studio codex-status`
- `forge-repo-studio codex-start [--ws-port ...] [--reuse|--no-reuse]`
- `forge-repo-studio codex-stop`
- `forge-repo-studio codex-exec --prompt "..."` (or stdin)
- `forge-repo-studio status`
- `forge-repo-studio stop [--app-runtime|--package-runtime]`
- `forge-repo-studio run <command-id> [--confirm]`

`forge-env portal` now reuses/launches RepoStudio via:

- `forge-repo-studio open --view env --reuse`

## Loop Cadence

RepoStudio follows the same mandatory cadence as Forge Loop:

1. `forge-loop progress`
2. `forge-loop discuss-phase <phase>`
3. `forge-loop plan-phase <phase>`
4. `forge-loop execute-phase <phase>`
5. `forge-loop verify-work <phase> --strict`
6. `forge-loop progress`
7. `forge-loop sync-legacy`

Multi-loop helpers:

- `forge-loop loop:list`
- `forge-loop loop:new <loop-id> --scope <paths>`
- `forge-loop loop:use <loop-id>`

## Policy Defaults

- command mode: `allowlist`
- sources: root scripts + workspace scripts + forge built-ins
- per-command enable/disable is persisted in `.repo-studio/local.overrides.json`
- confirmation is required before command execution
- deny patterns block destructive shell fragments

## Assistant

- Uses the same assistant route contract defined in `.repo-studio/config.json`.
- Manual planning-context attach is supported from the Planning workspace.
- `routeMode: codex|local|proxy|openrouter` is supported.
- `codex` mode enforces `chatgpt-strict` readiness by default (`codex login status` must report ChatGPT auth).

## Config

RepoStudio reads:

- shared: `.repo-studio/config.json`
- local machine state: `.repo-studio/local.overrides.json` (gitignored)

If missing, defaults are used.

Codex-first assistant example:

```json
{
  "assistant": {
    "enabled": true,
    "routeMode": "codex",
    "routePath": "/api/assistant-chat",
    "defaultModel": "gpt-5",
    "codex": {
      "enabled": true,
      "cliCommand": "codex",
      "authPolicy": "chatgpt-strict",
      "mode": "app-server",
      "appServerUrl": "ws://127.0.0.1:3789",
      "defaultModel": "gpt-5",
      "approvalMode": "on-request",
      "sandboxMode": "workspace-write"
    }
  }
}
```

Runbooks:

- `docs/01-quickstart.md`
- `docs/02-command-policy.md`
- `docs/03-headless-env-flow.md`
- `docs/04-forge-loop-console.md`
- `docs/05-assistant.md`
