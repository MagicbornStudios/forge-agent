# Headless Gate

Headless mode must fail fast when required env keys are missing.

Runner mode is explicit and controls the readiness checks:

- `--runner codex`: requires Codex CLI installed and ChatGPT-authenticated login.
- `--runner openrouter`: requires provider-key readiness from discovered env sources.
- `--runner custom`: no built-in provider checks.

## Validate

```bash
forge-env doctor --mode headless --runner codex --strict
```

Codex runner readiness check:

```bash
codex login
codex login status
```

## Repair with GUI

```bash
forge-env portal --mode headless --bootstrap
```

Bootstrap mode closes only after required keys are satisfied.

For non-bootstrap interactive sessions, `forge-env portal` prefers launching RepoStudio Env workspace first when available.

## Profile fallback behavior

When `profileFallback` is `accept-satisfied`, key satisfaction from alternate discovered `.env*` files is accepted with warnings instead of hard-blocking on profile label mismatch.

