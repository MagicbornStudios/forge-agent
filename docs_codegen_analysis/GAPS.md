# Docs Codegen Gaps

| Gap | Current | Target |
|-----|---------|--------|
| API docs from code | None | TypeDoc or equivalent |
| Component prop docs | Manual in readmes | Descriptor + codegen |
| Catalog data | Manual catalog-data.mjs | Derive from registry or extend |
| Build determinism | — | No flakiness; reproducible |
| Fumadocs integration | source.config.ts | Content from generated sources |

## Dependencies

- Fumadocs source APIs
- packages/shared showcase registry
- Settings tree-as-source pattern (extend for descriptors)
