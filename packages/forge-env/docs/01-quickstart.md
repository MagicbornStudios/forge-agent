# Quickstart

1. Initialize profile config:

```bash
forge-env init --profile forge-loop
```

2. Reconcile and write env files safely:

```bash
forge-env reconcile --write --sync-examples
```

3. Validate headless readiness:

```bash
forge-env doctor --mode headless --runner codex --strict
```

Codex runner prerequisites:

```bash
codex login
codex login status
```

4. If missing keys are reported, open the portal:

```bash
forge-env portal --mode headless --bootstrap
```

For non-bootstrap sessions, `forge-env portal` launches RepoStudio Env workspace first when available.

