# Platform PRD — Repo Studio backend and integration gateway

## Vision

Platform is the **backend and integration gateway** for Repo Studio: auth, API keys, proxy APIs (Open Router, extension fetch), and connection validation. Repo Studio connects to the platform for desktop auth; when connected, it can use platform-held credentials via proxy endpoints so users do not need to manage Open Router or GitHub tokens locally.

## Repo Studio support (from Phase 15)

- Desktop auth and API key / session scopes (`repo-studio.*`, connect, read, write).
- Connection validation and capability payload (see Gateway pattern below).
- **Deprecate:** Forge graphs and Yarn Spinner dialogue on platform; no new investment there. Platform roadmap prioritizes Repo Studio support.

## Gateway pattern

- **Credentials live on platform** (e.g. Vercel env): Open Router API key, GitHub token for RepoStudio-Extensions fetch. Set by humans; see [.planning/HUMAN-TASKS.md](.planning/HUMAN-TASKS.md).
- **Platform exposes BFF/proxy endpoints:** e.g. chat proxy to Open Router, extension-fetch from RepoStudio-Extensions repo. Gated by existing desktop/platform auth.
- **Repo Studio calls platform when connected:** Uses capability flags in the auth/status response to decide proxy vs local (e.g. when `openRouterProxy` is true, assistant chat goes through platform; when `extensionInstallProxy` is true and user has no GitHub token, extension install goes through platform).
- **Capability payload:** Auth response includes `capabilities.openRouterProxy`, `capabilities.extensionInstallProxy` (and existing connect/read/write). Platform sets these from env presence.

## Roadmap

1. **Open Router proxy (Phase 18)** — Platform proxy for chat; Repo Studio uses it when connected and capability set.
2. **Extension install proxy (Phase 18)** — Platform fetches extension content from RepoStudio-Extensions; Repo Studio uses when capability set and no user GitHub token.
3. **Entitlements (future)** — For monetization: subscription check, tier, extension gating. Desktop calls platform to validate; platform returns `{ active, tier }`. See [.planning/MONETIZATION-STRATEGY.md](.planning/MONETIZATION-STRATEGY.md).
4. **Future integrations** — Add proxy/capabilities as needed (e.g. other AI or data sources).

## Human-only setup

All one-off setup (repos, env/secrets, Vercel projects, npm org, OAuth/GitHub App) is listed in [.planning/HUMAN-TASKS.md](.planning/HUMAN-TASKS.md). Do not block agent tasks on those; humans complete and mark done. Agents check HUMAN-TASKS before assuming a task is blocked on human action.

## References

- Phase 18: [.planning/phases/18-platform-integration-gateway/](.planning/phases/18-platform-integration-gateway/)
- Phase 15 product intent: [.planning/phases/15-strategic-shift-repo-studio-platform-focus/15-PRD.md](.planning/phases/15-strategic-shift-repo-studio-platform-focus/15-PRD.md)
- Human tasks: [.planning/HUMAN-TASKS.md](.planning/HUMAN-TASKS.md)
