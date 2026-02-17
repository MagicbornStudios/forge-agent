# Phase 07: Structured parsers and story publish pipeline - Plan 03 Summary

## Outcome
- Added RepoStudio-local publish persistence collections:
  - `apps/repo-studio/payload/collections/repo-pages.ts`
  - `apps/repo-studio/payload/collections/repo-blocks.ts`
- Extended `apps/repo-studio/payload.config.ts` to include new collections.
- Added shared publish repository/service layer:
  - `apps/repo-studio/src/lib/story/publish-repository.ts`
  - `apps/repo-studio/src/lib/story/publish-service.ts`

## API Contracts Implemented
- `POST /api/repo/story/publish/preview`
- `POST /api/repo/story/publish/queue`
- `POST /api/repo/story/publish/apply`

## Behavior Guarantees
- Publish apply is approval-gated (`approved=true` required).
- Scope guard is enforced for preview/apply (`story` domain roots + override token policy).
- Page upsert key: `(loopId, sourcePath)` resolution in service layer.
- Block replacement is hash-aware and idempotent (no-op on unchanged hash unless forced).

## Verification
- RepoStudio app build + route generation includes new publish endpoints.
