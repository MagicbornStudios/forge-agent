# Docs Compile-from-Code PRD

## Vision

Docs site compiles from code deterministically. MDX + Fumadocs for narrative; generated component props and catalog from code.

## Current Stack

- apps/docs: Fumadocs, MDX, source.config.ts
- Component showcase: catalog-data.mjs (manual sections/entries), build-showcase-registry, generate-showcase-code
- Settings: tree-as-source → codegen → generated/defaults.ts (pattern to extend)

## Features (Recommended)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F1 | meta.json per demo → catalog | Recommended | DC-01; replaces manual catalog-data.mjs |
| F2 | fumadocs-typescript for props tables | Recommended | DC-02; AutoTypeTable in showcase MDX |
| F3 | TypeDoc for full API reference | Optional | DC-03; add only if full package API docs needed |
| F4 | Deterministic build (no flakiness) | TBD | — |
| F5 | Single source of truth for "what gets built" | In progress | meta.json + registry scan achieves this for showcase |

## Non-Scope

- Replacing MDX
- Moving off Fumadocs (unless research shows compelling reason)

## Implementation Order

1. **meta.json** — Add to each demo folder; script to generate catalog from registry scan.
2. **fumadocs-typescript** — Install; add AutoTypeTable to component showcase MDX for props.
3. **TypeDoc** — Only if full package API docs are required.
