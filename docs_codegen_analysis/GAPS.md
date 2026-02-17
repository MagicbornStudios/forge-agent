# Docs Codegen Gaps

| Gap | Current | Target |
|-----|---------|--------|
| Catalog data | Manual catalog-data.mjs | meta.json per demo → registry scan → generated catalog (DC-01) |
| Component prop docs | Manual in readmes | fumadocs-typescript AutoTypeTable in MDX (DC-02) |
| Full API reference | Sparse manual | TypeDoc optional—only if full package API docs needed (DC-03) |
| Build determinism | — | No flakiness; reproducible |
| Fumadocs integration | source.config.ts | Content from generated catalog; props from TS via fumadocs-typescript |

## Dependencies

- Fumadocs source APIs
- packages/shared showcase registry
- Settings tree-as-source pattern (extend for descriptors)
- fumadocs-typescript (for F2)
