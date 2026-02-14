# Troubleshooting

## Missing keys keep failing in headless mode

- run `forge-env doctor --mode headless --runner codex --strict --json`
- inspect `missing` list
- launch `forge-repo-studio open --view env --mode headless`
- set keys with `forge-env portal --mode headless --bootstrap`

## Codex runner fails readiness

- run `codex --version` and ensure CLI is installed
- run `codex login`
- run `codex login status` and confirm ChatGPT auth
- rerun `forge-env doctor --mode headless --runner codex --strict --json`

## OpenRouter runner fails readiness

- rerun with `forge-env doctor --mode headless --runner openrouter --strict --json`
- inspect missing provider-key requirements in `missing`/`runnerChecks`

## Reconcile changed too much

- check backups (`*.bak.<timestamp>`)
- rerun with `forge-env diff` first before `--write`

## Profile mismatch but keys are already present

- keep `profileFallback: "accept-satisfied"` in `.forge-env/config.json`
- rerun `forge-env doctor --mode headless`

## Deprecated profile alias warning (`generic`)

Use `forge-loop` instead of `generic` in commands/config.

