# Assistant

RepoStudio Assistant uses a single config contract from `.repo-studio/config.json`.

## Config

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
      "mode": "exec",
      "appServerUrl": "ws://127.0.0.1:3789",
      "defaultModel": "gpt-5",
      "approvalMode": "on-request",
      "sandboxMode": "workspace-write"
    }
  }
}
```

## Modes

- `codex`: runs Codex CLI-backed assistant flow with strict ChatGPT login requirement.
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

Attach planning docs from the `Planning` tab with `Attach To Assistant`, then copy/paste the generated context block into chat prompts.
