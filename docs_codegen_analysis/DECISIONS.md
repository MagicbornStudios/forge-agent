# Docs Codegen Decisions

Decisions from analysis (2026-02). Implementation order: meta.json → fumadocs-typescript → TypeDoc (if needed).

## DC-01: Catalog from meta.json

**Decision**: Use `meta.json` per demo folder (e.g. `registry/atoms/button-demo/meta.json`) with `id`, `title`, `summary`, `section`. Script scans registry, reads meta files, generates catalog. Replaces hand-maintained `catalog-data.mjs`.

**Rationale**: Single source of truth per demo; no drift between registry and catalog; reduces search/confusion when adding or finding demos.

## DC-02: Component props via fumadocs-typescript

**Decision**: Use **fumadocs-typescript** for component prop tables. Add `<AutoTypeTable path="..." name="ButtonProps" />` in showcase MDX. Props stay in sync with code.

**Rationale**: Fumadocs-native; embeds type tables into existing MDX. Does not generate full API docs—only the types you reference.

## DC-03: Full API reference via TypeDoc (optional)

**Decision**: **TypeDoc** only if full package API reference is needed (all exports from @forge/shared, functions, hooks, types). fumadocs-typescript does not replace this—it embeds specific types, not entire packages.

**Rationale**: TypeDoc generates hierarchical API docs. Add when/if we want automated "every export from @forge/shared" style docs.

## DC-04: OpenAPI and streaming endpoints

**Decision**: OpenAPI spec is for **documentation only**. Client generators (openapi-typescript-codegen, etc.) do not support streaming responses. All SSE/streaming endpoints use **manual client modules** in `lib/api-client/` (e.g. workflows.ts); do not add them to the spec to generate a client.

**Rationale**: Keeps AGENTS.md and how-to alignment. Documented in errors-and-attempts.
