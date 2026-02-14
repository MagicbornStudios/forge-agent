# Docs Codegen Findings

## Current State

- Fumadocs: source.config.ts, MDX content, ComponentDemo
- build-showcase-registry: scans registry/, outputs registry.generated.tsx
- generate-showcase-code: _showcase-code-map.json → catalog-code.generated.mjs
- generate-shared-showcase-docs: catalog-data.mjs → apps/docs/content/docs/components/showcase/*.mdx
- catalog-data.mjs: hand-maintained (sections, titles, summaries, descriptions)

## Research Needed

- Fumadocs content APIs and file-based vs programmatic content
- TypeDoc JSON/markdown output for Fumadocs
- Docusaurus TypeDoc plugin comparison
