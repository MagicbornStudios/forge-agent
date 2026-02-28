# Phase 17: Platform submodule, docs deploy, and deployment matrix

## Purpose

Platform app source of truth lives in a separate GitHub repo ([MagicbornStudios/RepoStudio-Platform](https://github.com/MagicbornStudios/RepoStudio-Platform)). This phase adds that repo as a **submodule** in forge-agent (`vendor/platform`), gets the **docs site** (apps/docs) deployed to Vercel from forge-agent, ensures the **platform** deploys to Vercel from its own repo with correct env (e.g. `NEXT_PUBLIC_DOCS_APP_URL`), and documents the **deployment matrix**. forge-agent becomes: docs site + shared packages + Electron releases + submodules (repo-studio, repo-studio-extensions, platform).

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, DECISIONS, TASK-REGISTRY, and this phase folder.
- Platform app canonical source: **MagicbornStudios/RepoStudio-Platform** (separate repo).
- Docs site: **apps/docs** in forge-agent (@forge/docs).

## Key documents

- **17-01-PLAN.md** — Add Platform submodule; update .gitmodules and release workflow; verify clone/build.
- **17-02-PLAN.md** — Docs site Vercel-ready and deploy from forge-agent.
- **17-03-PLAN.md** — Platform deploy from RepoStudio-Platform repo; env matrix; remove/archive in-repo apps/platform when submodule is canonical.
- **17-04-PLAN.md** — Deployment matrix and CI: what deploys where, repos, env/URL matrix; release workflow update.

## Current understanding

1. **RepoStudio-Platform repo** — [MagicbornStudios/RepoStudio-Platform](https://github.com/MagicbornStudios/RepoStudio-Platform). Platform app deploys to **Vercel from that repo**. Platform must set `NEXT_PUBLIC_DOCS_APP_URL` to the deployed docs site URL (from forge-agent).
2. **forge-agent** — Public. Contains: **docs site** (apps/docs) → Vercel; **shared packages** → npm; **Electron** → GitHub Releases (tag `v*`); submodules: vendor/repo-studio (Phase 16), vendor/repo-studio-extensions, **vendor/platform** (this phase).
3. **Docs site** — Stays in forge-agent at apps/docs; deploy to Vercel from forge-agent (separate Vercel project or same org).
4. **Platform in-repo** — apps/platform will be removed or archived once vendor/platform submodule is integrated and release/verify gates updated.

## Dependencies

- Phase 16 (Repo Studio submodule) is independent; Phase 17 can proceed in parallel or after.
- RepoStudio-Platform repo exists on GitHub with platform app code.

## References

- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/DECISIONS.md](../../DECISIONS.md).
- Release workflow: [.github/workflows/release-repo-studio-desktop.yml](../../../.github/workflows/release-repo-studio-desktop.yml).
- Docs app: [apps/docs](../../../apps/docs). Platform app: [apps/platform](../../../apps/platform).
