# Existing Project Onboarding

## Existing repo with drifted env files

```bash
forge-env init --profile custom
forge-env diff --mode local
forge-env reconcile --write --sync-examples
forge-env doctor --mode local
```

## Existing forge-agent monorepo

```bash
forge-env init --profile forge-agent
forge-env reconcile --write --sync-examples
forge-env doctor --mode local --strict
```

## Existing forge-loop consumer repo

```bash
forge-env init --profile forge-loop
forge-env reconcile --write --sync-examples
forge-env doctor --mode headless --strict
```

