---
created: 2026-02-04
updated: 2026-02-11
---

# Forge Agent Setup

> Monorepo note: the Studio app lives in `apps/studio`. Use `pnpm dev` from repo root.

## Prerequisites

- Node 20+
- pnpm 9+

## Install

```bash
pnpm install
```

## Environment

**Recommended (portal):** Run `pnpm dev`. If keys are missing, the env portal opens in your browser. Fill values and click Save. Rerun `pnpm dev`.

**Manual setup:**

```bash
pnpm env:portal    # Web UI for Studio + Platform + Vercel sync
# or
pnpm env:setup     # CLI setup (--app studio|platform|all)
```

Env files are written to `apps/studio/.env.local` and `apps/platform/.env.local`. Source of truth: [scripts/env/manifest.mjs](scripts/env/manifest.mjs).

**Minimal for local dev:**

```env
OPENROUTER_API_KEY=sk-or-v1-...
PAYLOAD_SECRET=dev-secret-change-me
```

**Local auto-login** (optional): Set `NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN=1` to use seeded admin (`admin@forge.local` / `admin12345`). See `apps/studio/.env.example` for full reference.

**LangGraph** (optional): `AI_LANGGRAPH_ENABLED=1` and `NEXT_PUBLIC_AI_LANGGRAPH_ENABLED=1` enable the LangGraph chat path. See [AI migration index](docs/ai/migration/00-index.mdx).

**Vercel sync:** Fill the Vercel section in the portal (token, project IDs), then click "Sync to Vercel". Or run `pnpm env:sync:vercel` with `.env.vercel.local` configured.

**Check env drift:**

```bash
pnpm env:doctor
```

**Pre-dev guard:** `pnpm dev` runs `pnpm env:bootstrap` first; when keys are missing, the portal opens. Set `FORGE_SKIP_ENV_BOOTSTRAP=1` or `CI=1` to skip.

## Generate Payload types

Run this after any collection changes:

```bash
pnpm payload:types
```

This outputs `packages/types/src/payload-types.ts`.

## Run Studio

```bash
pnpm dev
```

Open http://localhost:3000

## Tests

```bash
pnpm test
```
