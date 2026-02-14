# Assistant

RepoStudio exposes two assistant editors:

- `loop-assistant` for loop orchestration and planning operations
- `codex-assistant` for code/repo operations

Both use the same config contract from `.repo-studio/config.json`, but routing is split by `editorTarget`:

- `editorTarget=loop-assistant`: non-Codex shared runtime path (or proxy if explicitly configured).
- `editorTarget=codex-assistant`: Codex path (app-server transport primary, exec fallback optional).

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
      "transport": "app-server",
      "execFallbackAllowed": false,
      "appServerUrl": "ws://127.0.0.1:3789",
      "defaultModel": "gpt-5",
      "approvalMode": "on-request",
      "sandboxMode": "workspace-write"
    },
    "applyPolicy": {
      "mode": "review-queue",
      "allowPlanningWrites": true,
      "requireApproval": true
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

Story contexts can be attached from the `Story` panel, and scope guard rules apply when Codex turns propose edits outside configured story roots.

When codex requests file/planning changes, RepoStudio records a proposal in `.repo-studio/proposals.json` and requires explicit apply/reject via the `Review Queue` workspace.
