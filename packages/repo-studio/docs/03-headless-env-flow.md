# Headless Env Flow

Recommended sequence:

```bash
forge-env doctor --mode headless --runner codex --strict
forge-repo-studio codex-status
forge-repo-studio open --view env --mode headless
forge-loop doctor --headless
```

When missing keys are found:

1. Open RepoStudio `Env` tab.
2. Run `Doctor` and review missing/conflict output.
3. Run `Reconcile --write --sync-examples`.
4. Re-run `forge-env doctor --mode headless --runner codex --strict`.
5. Resume lifecycle with `forge-loop progress`.

If `forge-loop` headless checks fail in interactive mode, RepoStudio env view is launched first; legacy portal fallback remains available.
