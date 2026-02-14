# Docs Compile-from-Code Analysis Loop

Planning for deriving docs from code: TypeDoc, Fumadocs content APIs, showcase integration.

## Goal

Compile docs from code with no issues. Current stack: MDX + Fumadocs. Extend to API extraction (TypeDoc), component prop docs (settings-style descriptors), and deterministic build pipeline.

## Relationship

- apps/docs: Fumadocs, source.config.ts, ComponentDemo
- packages/shared showcase: catalog-data.mjs (manual), build-showcase-registry, generate-showcase-code
- settings: tree-as-source + codegen (patterns to extend)

## Contents

| Document | Purpose |
|----------|---------|
| [PRD.md](PRD.md) | Vision; compile-from-code workflow |
| [GAPS.md](GAPS.md) | Current vs target |
| [DECISIONS.md](DECISIONS.md) | TypeDoc vs alternatives; pipeline |
| [FINDINGS.md](FINDINGS.md) | Fumadocs content APIs; TypeDoc plugins |

## Config

`config.json`: `{"mode":"analysis","execution":false}`
