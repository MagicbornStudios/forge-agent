# Docs Codegen Findings

## Current State

- Fumadocs: source.config.ts, MDX content, ComponentDemo
- build-showcase-registry: scans registry/, outputs registry.generated.tsx
- generate-showcase-code: _showcase-code-map.json → catalog-code.generated.mjs
- generate-shared-showcase-docs: catalog-data.mjs → apps/docs/content/docs/components/showcase/*.mdx
- catalog-data.mjs: hand-maintained (sections, titles, summaries, descriptions)

## Resolved (see DECISIONS.md)

- **Catalog source**: meta.json per demo folder; script scans registry
- **Component props**: fumadocs-typescript AutoTypeTable in MDX
- **Full API reference**: TypeDoc optional, only if needed

## Still Open

- Fumadocs content APIs and file-based vs programmatic content (if extending beyond catalog)
- Deterministic build hardening
