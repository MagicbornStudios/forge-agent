# Phase 18: Platform integration gateway

## Purpose

Platform acts as **integration gateway (BFF)** for Repo Studio: it holds credentials (Open Router, GitHub for extensions), exposes proxy/BFF APIs, and returns capability flags in the auth response so Repo Studio can use Open Router chat and extension install without user-held secrets when connected to the platform.

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, DECISIONS, TASK-REGISTRY, and this phase folder.
- Platform app canonical source: **MagicbornStudios/RepoStudio-Platform** (separate repo; see Phase 17 submodule at vendor/platform).
- Gateway = proxy APIs (Open Router, extension fetch) + capability payload in auth response.

## Key documents

- **18-01-PLAN.md** — Open Router proxy: platform exposes chat/proxy endpoint; Repo Studio calls platform when connected; platform uses OPENROUTER_API_KEY (human-set in Vercel).
- **18-02-PLAN.md** — Extension install via platform: when user has no GitHub token, Repo Studio calls platform; platform fetches from RepoStudio-Extensions repo and returns content or signed URL.
- **18-03-PLAN.md** — Extend capability payload and Repo Studio usage: add flags (e.g. openRouterProxy, extensionInstallProxy) to RepoAuthStatusResponse.capabilities; Repo Studio checks capabilities before using proxy vs local.

## Dependencies

- **Phase 17** (Platform submodule and docs deploy): platform in RepoStudio-Platform repo and as submodule; platform and docs on Vercel. Phase 18 builds on that deployment surface.
- Human setup (Vercel env, GitHub token for extensions) is tracked in [.planning/HUMAN-TASKS.md](../../HUMAN-TASKS.md); agents check there before blocking.

## References

- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/DECISIONS.md](../../DECISIONS.md), [.planning/PLATFORM-PRD.md](../../PLATFORM-PRD.md).
- Auth response types: [apps/repo-studio/src/lib/api/types.ts](../../../apps/repo-studio/src/lib/api/types.ts) (`RepoAuthStatusResponse.capabilities`).
