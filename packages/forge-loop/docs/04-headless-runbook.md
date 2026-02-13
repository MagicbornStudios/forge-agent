# Headless Runbook

Headless means an external runner launches your coding agent without interactive prompts.

Forge Loop does not bundle a provider runtime. You supply the external agent command.

## Shell-agnostic flow

1. run `forge-loop progress` to identify the next phase action
2. generate or refresh phase artifacts (`discuss-phase`, `plan-phase`)
3. invoke your external coding agent against repository + `.planning/prompts/*`
4. run `execute-phase` and `verify-work --non-interactive --strict`
5. sync legacy snapshots if needed

## Bash example

```bash
set -euo pipefail

PHASE=1
forge-loop discuss-phase "$PHASE"
forge-loop plan-phase "$PHASE"

# Replace AGENT_CMD with your own runner
AGENT_CMD="${AGENT_CMD:-echo 'configure AGENT_CMD'}"
bash -lc "$AGENT_CMD"

forge-loop execute-phase "$PHASE" --non-interactive
forge-loop verify-work "$PHASE" --non-interactive --strict
forge-loop progress
```

## PowerShell example

```powershell
$ErrorActionPreference = "Stop"

$phase = "1"
forge-loop discuss-phase $phase
forge-loop plan-phase $phase

# Replace AGENT_CMD with your own runner
$agentCmd = $env:AGENT_CMD
if ([string]::IsNullOrWhiteSpace($agentCmd)) { $agentCmd = "Write-Output 'configure AGENT_CMD'" }
powershell -Command $agentCmd

forge-loop execute-phase $phase --non-interactive
forge-loop verify-work $phase --non-interactive --strict
forge-loop progress
```

## Scheduler/CI notes

- set `--non-interactive` for unattended runs
- keep strict verify enabled to fail fast
- archive `.planning/*` artifacts between runs for continuity
