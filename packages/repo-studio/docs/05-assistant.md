# Assistant

RepoStudio exposes two assistant editors:

- `loop-assistant` for loop orchestration and planning operations
- `codex-assistant` for code/repo operations

Both use the same config contract from `.repo-studio/config.json`.

## Config

```json
{
  "assistant": {
    "enabled": true,
    "defaultEditor": "loop-assistant",
    "editors": ["loop-assistant", "codex-assistant"],
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

## Modes

- `codex`: Codex-first route with strict ChatGPT login requirement.
  - `codex-assistant` uses app-server-first checks and explicit exec fallback controls.
- `local`: RepoStudio app runtime with manual planning-context attachment.
- `proxy`: forwards chat requests to absolute `http(s)` `routePath`.
- `openrouter`: routed through the configured proxy/backend for OpenRouter-enabled assistants.

## Readiness

Run:

```bash
codex login
codex login status
forge-repo-studio codex-status
forge-env doctor --mode headless --runner codex --strict
```

Attach planning docs from the `Planning` tab with `Attach To Assistant`, then copy/paste the generated context block into either assistant editor as needed. Diff contexts can also be attached from the `Diff` workspace.
