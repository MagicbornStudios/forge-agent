# Repo Studio Workspace Feature Audit

Cross-workspace comparison of features. Used to identify gaps—especially for Env workspace—and ensure consistent patterns.

## Workspace Inventory

| Workspace | Rail | Primary Role |
|-----------|------|--------------|
| Loop Cadence | left | Loop selection/status |
| Planning | main | .planning docs; loop artifacts |
| Commands | main | Run/toggle package commands |
| Story | main | Story files; act/chapter/page tree |
| Code | main | File tree; read/write Monaco |
| Env | right | Env readiness; doctor; reconcile |
| Loop Assistant | right | Attach docs; chat |
| Codex Assistant | right | Attach docs; chat |
| Docs | bottom | Runbooks/contracts links |
| Terminal | bottom | Command output |
| Diff | bottom | Git diff; Monaco diff |
| Git | bottom | Status; branches; log; commit |
| Review Queue | bottom | Proposals; apply/reject |

## Feature Matrix

| Feature | Planning | Commands | Story | Code | Env | Diff | Git | Review |
|---------|----------|----------|-------|------|-----|------|-----|--------|
| **Read** | ✓ raw text | ✓ table | ✓ tree + Monaco | ✓ tree + Monaco | ✓ doctor pre | ✓ diff Monaco | ✓ status/log | ✓ list |
| **Write/Edit** | ✗ | ✗ (run only) | ✓ Monaco save | ✓ Monaco save | ✗ | ✗ view | ✗ | ✓ apply/reject |
| **API integration** | ✓ loop APIs | ✓ command run | ✓ story APIs | ✓ file APIs | ✓ doctor/reconcile | ✓ diff APIs | ✓ git APIs | ✓ proposals API |
| **onCopyText** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **onAttachToAssistant** | ✓ | — | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| **Filter/search** | doc list | source/tab | tree + scope | query + scope | — | — | — | — |
| **Refresh** | implicit | run | ✓ | ✓ | ✓ Doctor/Reconcile | ✓ | ✓ | ✓ |

## Env vs Other Workspaces: What Env Has

- Profile + mode selectors
- Doctor, Reconcile buttons
- Doctor Snapshot (missing/conflicts/warnings tables)
- Discovery stats (manifest/discovered/merged/selected)
- Runtime Dependency Health card
- onCopyText

## Env vs Other Workspaces: What Env Is Missing

Compared to **portal** (legacy) and **Code/Story** (edit-heavy):

| Missing | Portal Had | Code/Story Have | Env Should Add |
|---------|-------------|-----------------|----------------|
| Per-key editing | ✓ inputs per target | Monaco edit | Key inputs per target; Save/Refresh |
| Copy-paste into inputs | ✗ | — | Paste .env → parse KEY=VALUE → fill |
| Target grouping | ✓ sections per target | — | Target tabs/cards with key editors |
| Scope visibility | Implicit | — | package \| app \| vendor \| root filter |
| Mode per target | Mode in URL | — | local/dev/prod per target |
| Attach to Assistant | — | ✓ | Attach env summary or selected target |

## Workspace Patterns to Align With

1. **Edit-capable** (Code, Story): Monaco or form inputs; explicit save; baseline diff when applicable.
2. **Action-capable** (Commands, Git, Review): Run/refresh; optional apply/reject.
3. **Read-only** (Docs, Terminal): Display only; no write.

Env should move from read-only (doctor) to **edit-capable**: per-target key editors, Save, Refresh, copy-paste.

## Summary

- **Env workspace** is the only env UI; no standalone portal.
- Env needs: per-key editing, Save/Refresh, copy-paste, scope selector, mode per target.
- Align UX with Code/Story (explicit edit + save) and portal concepts (target sections, key inputs).
