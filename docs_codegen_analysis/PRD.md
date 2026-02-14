# Docs Compile-from-Code PRD

## Vision

Docs site compiles from code deterministically. MDX + Fumadocs for narrative; generated API docs and component descriptors from code. User fine with Docusaurus or TypeDoc "as long as I can compile from code with no issues."

## Current Stack

- apps/docs: Fumadocs, MDX, source.config.ts
- Component showcase: catalog-data.mjs (manual sections/entries), build-showcase-registry, generate-showcase-code
- Settings: tree-as-source → codegen → generated/defaults.ts (pattern to extend)

## Features (Proposed)

| ID | Feature | Status |
|----|---------|--------|
| F1 | TypeDoc for API/props extraction | TBD |
| F2 | Fumadocs content API integration | TBD |
| F3 | Settings-style descriptors for components (scope, id, description) | TBD |
| F4 | Deterministic build (no flakiness) | TBD |
| F5 | Single source of truth for "what gets built" | TBD |

## Non-Scope

- Replacing MDX
- Moving off Fumadocs (unless research shows compelling reason)

## Research Targets

- TypeDoc output + Fumadocs consumption
- Docusaurus TypeDoc plugin
- Settings-style extension: registry → generated docs
- Showcase: derive catalog from registry vs manual
