# Human-only tasks

Tasks that require **human action** (create repos, set env/secrets, configure Vercel, npm, OAuth). **Agents:** do not implement these; check status before blocking on them.

| ID | Description | Status | Blocks | Notes |
|----|-------------|--------|--------|-------|
| HT-01 | Create GitHub repo RepoStudio-Platform | Done | — | Exists. |
| HT-02 | Create GitHub repo RepoStudio-Extensions | Done | — | Exists. |
| HT-03 | Vercel: create project(s) for platform and docs | Pending | Phase 17/18 | Platform from RepoStudio-Platform repo; docs from forge-agent. |
| HT-04 | Vercel (platform): set OPENROUTER_API_KEY | Pending | Phase 18 (Open Router proxy) | Required for platform proxy. |
| HT-05 | Vercel (platform): set NEXT_PUBLIC_DOCS_APP_URL | Pending | Phase 17 | For docs link from platform. |
| HT-06 | Platform: GitHub token for RepoStudio-Extensions fetch | Pending | Phase 18 (extension install) | Read-only token for extension content. |
| HT-07 | npm: create org/scope if needed; first publish; 2FA | Pending | Release flow | If not already done. |
| HT-08 | GitHub App / OAuth: create app, client ID/secret, install on org | Pending | If needed for platform auth | Optional depending on current auth. |
| HT-09 | Provide Windows code-signing certificate and release-signing ownership for RepoStudio desktop | Pending | Desktop release trust/signing | Deferred until 50k funding/revenue. Currently at 0; no foreseeable monetization plan. Requires in-depth discussion. |
| HT-10 | Provide a proper multi-size Windows `.ico` asset for RepoStudio installer/executable branding | Done | — | `repo_studio.ico` placed at `packages/repo-studio/build/repo-studio.ico`; electron-builder and main window use it. |

Append new rows for new human-only items; do not remove rows (keep history).
