# Assistant

RepoStudio exposes one assistant workspace with two runtimes:

- `forge` for planning/orchestration and shared runtime tools
- `codex` for code/repo operations

Routing uses `assistantTarget`:

- `assistantTarget=forge`
- `assistantTarget=codex`

## Config

```json
{
  "assistant": {
    "enabled": true,
    "defaultTarget": "forge",
    "targets": ["forge", "codex"],
    "routeMode": "codex",
    "routePath": "/api/assistant-chat",
    "routes": {
      "forge": {
        "mode": "shared-runtime",
        "routePath": "/api/assistant-chat"
      },
      "codex": {
        "mode": "codex",
        "transport": "app-server",
        "execFallbackAllowed": false
      }
    },
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
- `local`: RepoStudio app runtime with manual planning-context attachment.
- `proxy`: forwards chat requests to absolute `http(s)` `routePath`.
- `openrouter`: routed through the configured proxy/backend for OpenRouter-enabled assistants.

## Readiness

Run:

```bash
codex login
codex login status
forge-repo-studio codex-status
forge-repo-studio codex-login
forge-env doctor --mode headless --runner codex --strict
```

You can also authenticate directly from the `Codex Assistant` panel using the `Sign In` action in `Codex Setup`.

Attach planning docs from the `Planning` tab with `Attach To Assistant`, then copy/paste the generated context block into assistant chat as needed. Diff contexts can also be attached from the `Diff` workspace.

Story contexts can be attached from the `Story` panel, and scope guard rules apply when Codex turns propose edits outside configured story roots.

When codex requests file/planning changes, RepoStudio records a proposal in SQLite (`repo-proposals` collection) and routes review/apply through the `Review Queue` workspace.

## Review Queue Trust Mode

Settings key:

- `reviewQueue.trustMode`: `require-approval` | `auto-approve-all`

Behavior:

- `require-approval` (default): proposals remain pending until user action.
- `auto-approve-all`: new proposals auto-apply immediately when scope guard permits.
- Scope guard is never bypassed by trust mode.

Review Queue patch APIs:

- `GET /api/repo/proposals/diff-files?proposalId=<id>`
- `GET /api/repo/proposals/diff-file?proposalId=<id>&path=<repo-relative>`
