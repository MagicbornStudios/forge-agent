# Studio Docs Legacy Archive Pointer

Date: 2026-02-14

Before this migration, Studio docs were sourced from the repository-level `docs/` directory:

- `apps/studio/source.config.ts` had `dir: '../../docs'`

The docs source for Studio now starts from the Platform baseline at:

- `apps/studio/content/docs`

The original legacy docs remain available at:

- `docs/`
