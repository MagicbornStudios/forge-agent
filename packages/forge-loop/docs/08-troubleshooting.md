# Troubleshooting

## `new-project` says `.planning` already exists

- run `forge-loop doctor`
- fix missing artifacts reported by doctor
- continue with `forge-loop progress`

## `execute-phase` fails with commit scope error

- confirm changed files are within configured `git.commitScope`
- unstage unrelated files outside scope
- rerun command

## `verify-work --strict` fails

- inspect `<phase>-VERIFICATION.md` and `<phase>-UAT.md`
- if gaps exist:
  - `forge-loop plan-phase <phase> --gaps`
  - `forge-loop execute-phase <phase> --gaps-only`
  - `forge-loop verify-work <phase> --strict`

## `sync-legacy` does nothing

- check `.planning/config.json` `legacySync.enabled`
- use `forge-loop sync-legacy --force` only when intentionally overriding disabled sync

## Plan frontmatter validation fails

- ensure required fields exist
- ensure YAML shape for `must_haves.truths/artifacts/key_links`
- ensure dependency graph references valid plan ids

## Doctor reports marker issues

- add/fix both generated markers in legacy target file
- rerun `forge-loop sync-legacy`
- rerun `forge-loop doctor`

## Recovery baseline commands

```bash
forge-loop doctor
forge-loop progress
forge-loop plan-phase <phase> --gaps
forge-loop execute-phase <phase> --gaps-only
forge-loop verify-work <phase> --strict
```
