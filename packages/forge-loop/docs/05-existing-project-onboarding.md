# Existing Project Onboarding

Use this decision tree when introducing Forge Loop into an existing repository.

## Decision tree

### Case A: existing repo, no legacy artifacts

Use:

```bash
forge-loop new-project --fresh --profile generic
forge-loop doctor
forge-loop progress
```

### Case B: existing repo, legacy artifacts present

Use:

```bash
forge-loop new-project
forge-loop doctor
forge-loop progress
```

`new-project` will auto-run migration if legacy files are detected.

### Case C: `.planning/` already exists

`new-project` will not overwrite. It returns validation guidance.

Then run:

```bash
forge-loop doctor
forge-loop progress
```

## Profile guidance

- `--profile forge-agent`: forge-agent command matrix defaults
- `--profile generic`: generic repository defaults
