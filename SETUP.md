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

Create `.env.local` at repo root (or in `apps/studio`) with:

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-or-v1-...
PAYLOAD_SECRET=dev-secret-change-me
```

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
