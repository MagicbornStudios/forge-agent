# Vendor cutover plan — docs first, then apps → vendor-only

**Status:** Plan. Get docs site deploying, then transition to updating only vendor submodules and committing them in one go.

---

## 1. Goals

1. **Docs site up** — `apps/docs` builds and deploys on Vercel without depending on `apps/platform` or uninitialized submodules.
2. **Single-command commit** — One script to commit all vendor submodule changes and update parent in one go (no cd into each repo).
3. **Cutover to vendor-only** — Stop editing in-repo `apps/*` counterparts; edit only in vendor submodules and pull into forge-agent via submodule pointers.

---

## 2. Docs site fix (immediate)

- **Done:** Remove `apps/docs` dependency on `../../platform/src/styles/theme.css`. Platform lives in `vendor/platform`; on Vercel submodules may not be fetched, and `apps/platform` does not exist. Docs now use `packages/shared` themes only.
- **Vercel submodules:** If deploy still fails with "Failed to fetch one or more git submodules", configure Vercel to run `git submodule update --init --recursive` (e.g. in Install Command or a pre-install script). Docs build itself should no longer require platform.

---

## 3. Submodule commit-all command

- **Script:** `scripts/vendor-commit-all.mjs` (or `scripts/submodules-commit.mjs`).
- **Behavior:**
  - For each submodule in `.gitmodules` (or a fixed list: vendor/get-shit-done, vendor/repo-studio-extensions, vendor/repo-studio, vendor/platform, docs): if there are staged or unstaged changes, run `git add -A && git commit -m "<message>"` (message from argv or default).
  - Then in parent: `git add <each submodule path>` and `git commit -m "chore: update submodules"` (or user message).
- **Package.json:** e.g. `"vendor:commit": "node scripts/vendor-commit-all.mjs"` with optional `--message "msg"` so you can run `pnpm vendor:commit -- --message "fix: desktop smoke"` and have all submodule changes committed together.

---

## 4. Cutover to only updating vendor modules

| Current | Target |
|--------|--------|
| Edit in forge-agent: `apps/repo-studio`, `apps/docs`, `apps/platform` | Edit in vendor: `vendor/repo-studio`, (docs?), `vendor/platform` |
| Build from forge-agent apps/ | Build from vendor when possible; forge-agent only wires packages + submodule refs |

**Phased approach:**

1. **Phase A — Docs**
   - Docs app: either keep in forge-agent (`apps/docs`) and only fix deps (done), or move docs app + content into `docs` submodule and have Vercel build from there. Current: keep `apps/docs` in forge-agent, no platform CSS dep.
   - Ensure Vercel build uses root monorepo (no submodule requirement for docs build).

2. **Phase B — Repo Studio (Phase 16)**
   - Canonical source: `vendor/repo-studio`. Stop editing `apps/repo-studio` in forge-agent; remove or archive when build/CI switch to vendor/repo-studio.
   - Use `pnpm vendor:commit` to commit repo-studio changes in vendor and update parent.

3. **Phase C — Platform (Phase 17)**
   - Canonical source: `vendor/platform`. Same pattern; archive or remove `apps/platform` from forge-agent when build uses vendor/platform.

4. **Phase D — Single commit workflow**
   - You work in repo; changes may touch vendor/repo-studio, vendor/get-shit-done, etc. Run `pnpm vendor:commit -- --message "your message"` to commit in each dirty submodule then update parent. Push parent; push submodule refs from each vendor repo when you have push access.

---

## 5. References

- Phase 16: [.planning/ROADMAP.md](ROADMAP.md) — Repo Studio canonical submodule
- Phase 17: Platform submodule and docs deploy
- [.planning/DECISIONS.md](DECISIONS.md) — deployment matrix, platform/repo-studio source of truth
