# @forge/forge-env

Profile-aware environment setup, reconciliation, and headless readiness checks.

`forge-env` is designed for humans and coding agents, and can run standalone in any repo.

## Quick start

```bash
forge-env init --profile forge-loop
forge-env reconcile --write --sync-examples
forge-env doctor --mode headless --runner codex --strict
```

If keys are missing and you want guided setup:

```bash
forge-env portal --mode headless --bootstrap
```

Default portal behavior now prefers launching RepoStudio Env workspace when available:

```bash
forge-env portal --mode local
```

To force legacy inline portal UI:

```bash
forge-env portal --mode local --legacy-portal
```

## Profiles

- `forge-agent`: monorepo defaults for Studio/Platform env targets.
- `forge-loop`: package-consumer default for root `.env*` files.
- `custom`: bring your own targets/required keys via `.forge-env/config.json`.

`generic` is accepted as a deprecated alias for `forge-loop`.

## Commands

- `forge-env init [--profile forge-agent|forge-loop|custom] [--force]`
- `forge-env doctor [--profile ...] [--mode local|preview|production|headless] [--runner codex|openrouter|custom] [--strict] [--bootstrap] [--json]`
- `forge-env portal [--profile ...] [--mode ...] [--bootstrap] [--legacy-portal]`
- `forge-env reconcile [--profile ...] [--write] [--sync-examples]`
- `forge-env diff [--profile ...] [--json]`
- `forge-env sync-examples [--profile ...] [--write]`

## Headless runners

- `codex`: requires local `codex` CLI and `codex login status` reporting `ChatGPT`.
- `openrouter`: requires provider-key readiness from discovered env files.
- `custom`: no built-in provider checks; only profile/env-key requirements apply.

## Safety model

- union all keys across discovered `.env*` + examples + profile templates
- preserve non-empty values
- preserve unknown keys
- optional backups before write
- headless readiness is runner-aware and key-satisfaction based, not profile-label strict

## Docs

- `docs/01-quickstart.md`
- `docs/02-existing-project-onboarding.md`
- `docs/03-headless-gate.md`
- `docs/04-custom-profile.md`
- `docs/05-troubleshooting.md`

