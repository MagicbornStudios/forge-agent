# Headless Runbook

Headless means an external runner launches your coding agent without interactive prompts.

Forge Loop does not bundle a provider runtime. You supply the external agent command.

## Shell-agnostic flow

1. run `forge-loop progress` to identify the next phase action
2. validate env readiness (`forge-env doctor --mode headless --runner <runner> --strict`)
3. generate or refresh phase artifacts (`discuss-phase`, `plan-phase`)
4. invoke your external coding agent against repository + `.planning/prompts/*`
5. run `execute-phase` and `verify-work --non-interactive --strict --headless`
6. sync legacy snapshots if needed

## Bash example

```bash
set -euo pipefail

PHASE=1
RUNNER="${RUNNER:-custom}"
forge-env doctor --mode headless --runner "$RUNNER" --strict
forge-loop discuss-phase "$PHASE"
forge-loop plan-phase "$PHASE"

# Replace AGENT_CMD with your own runner
AGENT_CMD="${AGENT_CMD:-echo 'configure AGENT_CMD'}"
bash -lc "$AGENT_CMD"

forge-loop execute-phase "$PHASE" --non-interactive --headless
forge-loop verify-work "$PHASE" --non-interactive --strict --headless
forge-loop progress
```

## PowerShell example

```powershell
$ErrorActionPreference = "Stop"

$phase = "1"
$runner = $env:FORGE_ENV_RUNNER
if ([string]::IsNullOrWhiteSpace($runner)) { $runner = "custom" }
forge-env doctor --mode headless --runner $runner --strict
forge-loop discuss-phase $phase
forge-loop plan-phase $phase

# Replace AGENT_CMD with your own runner
$agentCmd = $env:AGENT_CMD
if ([string]::IsNullOrWhiteSpace($agentCmd)) { $agentCmd = "Write-Output 'configure AGENT_CMD'" }
powershell -Command $agentCmd

forge-loop execute-phase $phase --non-interactive --headless
forge-loop verify-work $phase --non-interactive --strict --headless
forge-loop progress
```

## Scheduler/CI notes

- set `--non-interactive` for unattended runs
- keep strict verify enabled to fail fast
- choose runner explicitly when needed (`--runner <runner>`)
- archive `.planning/*` artifacts between runs for continuity
