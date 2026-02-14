# Custom Profile

`custom` is for existing repos that do not match forge-agent or forge-loop defaults.

1. Initialize:

```bash
forge-env init --profile custom
```

2. Edit `.forge-env/config.json` to define targets, required keys, and headless requirements.

3. Reconcile and validate:

```bash
forge-env reconcile --write --sync-examples
forge-env doctor --mode headless --strict
```

