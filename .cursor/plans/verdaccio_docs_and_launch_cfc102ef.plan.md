---
name: Verdaccio docs and launch
overview: Add a dedicated how-to for Verdaccio (what it is, quick launch, publish, consume) with crosslinks; make Verdaccio runnable without a global install; update doc index, contributor README, and architecture doc so contributors and external codebases can follow one guide.
todos: []
isProject: false
---

# Verdaccio setup and documentation

## Current state

- **Verdaccio** is already configured: [verdaccio.yaml](verdaccio.yaml) (storage `./verdaccio/storage`, proxy npmjs, `@forge/*` publish allowed). Root script: `pnpm registry:start` → `verdaccio --config ./verdaccio.yaml`.
- **Verdaccio is not a dependency**: the script assumes a global `verdaccio` binary; it does not appear in [pnpm-lock.yaml](pnpm-lock.yaml). Contributors would need `npm i -g verdaccio` or `pnpm dlx verdaccio`.
- **Docs**: Full publish/consume flow lives in [docs/architecture/04-component-library-and-registry.mdx](docs/architecture/04-component-library-and-registry.mdx) (Sections “Local registry: Verdaccio”, “Publish flow”, “Consume from another repo”). There is no dedicated how-to. [docs/how-to/01-foundation.mdx](docs/how-to/01-foundation.mdx) and [docs/how-to/05-building-a-workspace.mdx](docs/how-to/05-building-a-workspace.mdx) do not mention the registry. [packages/shared/contributor_workspaces/README.md](packages/shared/contributor_workspaces/README.md) and root [README.md](README.md) point to “build your own editor” and contributor_workspaces but not to “install dev-kit in another repo”.

## 1. Make Verdaccio launchable without global install

- Add **verdaccio** as a **root devDependency** in [package.json](package.json).
- Change the script to use the local binary so it works after `pnpm install`:
  - `"registry:start": "verdaccio --config ./verdaccio.yaml"` → keep as-is (pnpm will run from root and resolve `verdaccio` from node_modules/.bin), or use `"registry:start": "pnpm exec verdaccio --config ./verdaccio.yaml"` for explicitness.
- After adding the dependency, run `pnpm install` at repo root so the lockfile is updated.

Result: Contributors run `pnpm registry:start` from repo root with no global install.

## 2. New how-to: Verdaccio and local registry

Add **docs/how-to/24-verdaccio-local-registry.mdx** with:

- **Title / frontmatter**: e.g. `title: 24 - Verdaccio and local registry`.
- **What Verdaccio is** (brief): Local npm registry. We use it so other codebases (or your own external app) can install `@forge/ui`, `@forge/shared`, `@forge/agent-engine`, and `@forge/dev-kit` without publishing to public npm. It proxies public packages from npmjs; only `@forge/*` are published to the local instance.
- **Quick launch**:
  - From repo root: `pnpm install` (if not done), then `pnpm registry:start`. Verdaccio runs at `http://localhost:4873`. Optional: one-line note “Run in a separate terminal when publishing or consuming from another repo.”
  - If login is required: `npm adduser --registry http://localhost:4873`.
- **Publish flow (summary)**:
  - Build: `pnpm build:packages` (or build each package).
  - Publish: from each of `packages/ui`, `packages/shared`, `packages/agent-engine`, `packages/dev-kit` run `npm publish`. Point to [Architecture: Component library and registry](docs/architecture/04-component-library-and-registry.mdx) for full detail and `.npmrc` scope.
- **Consume from another repo**:
  - In consumer repo: `.npmrc` with `@forge:registry=http://localhost:4873`, then `"@forge/dev-kit": "^0.1.0"` (or specific packages), then `pnpm install`. Short usage snippet: import from `@forge/dev-kit`.
  - Crosslink to [examples/consumer](examples/consumer) (in-repo example) and [04](docs/architecture/04-component-library-and-registry.mdx).
- **Crosslinks** (in body and/or “Next”):
  - [01 - Foundation](docs/how-to/01-foundation.mdx) (running the app, packages).
  - [05 - Building an editor](docs/how-to/05-building-a-workspace.mdx) (build your own editor in this repo).
  - [20 - Create an editor](docs/how-to/20-create-a-workspace.mdx) (wiring an editor).
  - [Architecture: Component library and registry](docs/architecture/04-component-library-and-registry.mdx) (full publish/consume and dev-kit surface).
  - [Contributor workspaces](packages/shared/contributor_workspaces/README.md) (contribute an editor to this repo).
  - [Dev-kit consumer example](examples/consumer/README.md).

No code or config changes inside the how-to beyond the snippets above.

## 3. Doc updates and crosslinks

- **[docs/architecture/04-component-library-and-registry.mdx](docs/architecture/04-component-library-and-registry.mdx)**  
  - In the “Local registry: Verdaccio” section (after “Start Verdaccio” or at the end of that subsection), add one sentence: “For a step-by-step how-to (launch, publish, consume from another repo), see [How-to 24 - Verdaccio and local registry](../how-to/24-verdaccio-local-registry.mdx).”
- **[docs/how-to/00-index.mdx](docs/how-to/00-index.mdx)**  
  - In the main how-to table (or a short “Reference” subsection), add a row:  
  `| 24 | [Verdaccio and local registry](24-verdaccio-local-registry.mdx) | Run the local npm registry; publish and consume @forge/* so other codebases can use the dev-kit. |`
- **[docs/00-docs-index.mdx](docs/00-docs-index.mdx)**  
  - In the “How-to guides” table (or the “Architecture and reference” list), add an entry for the new guide so contributors see it (e.g. “24 - Verdaccio and local registry” linking to `how-to/24-verdaccio-local-registry.mdx`).
- **[packages/shared/contributor_workspaces/README.md](packages/shared/contributor_workspaces/README.md)**  
  - After “Build an editor” / how-tos, add a line: “To use `@forge/dev-kit` in a **separate repo** (e.g. your own app), run the local registry and follow [How-to 24 - Verdaccio and local registry](../../../docs/how-to/24-verdaccio-local-registry.mdx).”
- **[README.md](README.md)**  
  - In the “Publishing the component library” bullet (or equivalent), ensure it points to the new how-to as the primary “get Verdaccio up and running” guide; e.g. “See [How-to 24 - Verdaccio and local registry](docs/how-to/24-verdaccio-local-registry.mdx) to run Verdaccio and publish/consume; see [Architecture: Component library and registry](docs/architecture/04-component-library-and-registry.mdx) for full detail.”
- **[apps/studio/app/docs/docs-config.ts](apps/studio/app/docs/docs-config.ts)**  
  - Add a sidebar entry so the new guide appears in Studio `/docs`:  
  `{ slug: '24-verdaccio-local-registry', label: '24 - Verdaccio and local registry' }`  
  - Place it after 23 (if 23 exists in the list) or with the other 2x how-tos (e.g. after 22).

## 4. Optional: auto-launch

- **No implementation in this plan.** “Quick launch” is covered by `pnpm registry:start` after adding the devDependency.
- If desired later: a small script or note could “auto-start” Verdaccio (e.g. check if port 4873 is up, else start `verdaccio` in the background) before a publish or consumer install; that can be a follow-up. The how-to can mention: “For publish or consuming from another repo, run `pnpm registry:start` in a separate terminal (or in the background) so the registry is available.”

## 5. Outcome for contributors

- Contributors can follow **one how-to (24)** to: understand what Verdaccio is, start it with `pnpm registry:start`, publish foundation packages, and consume `@forge/dev-kit` from another codebase.
- They can still use the **dev-kit** to create their own editor (05, 20, contributor_workspaces) and, when needed, use the same guide to run the registry for external consumption. All crosslinks above keep the flow discoverable from docs index, architecture, and contributor README.

