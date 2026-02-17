# Story Domain (Codex Writer)

RepoStudio supports a story-focused editing domain rooted at `content/story/`.

Default canonical create path:

- `content/story/act-01/chapter-01/page-001.md`

Dual naming is supported for reading:

- `act (1)` and `act-01`
- `chapter (1)` and `chapter-01`
- `page (1).md`, `page-001.md`, and `001.md`

RepoStudio does not force-rename legacy files; canonical naming is used only for new creates.

## Required Config

```json
{
  "domains": {
    "story": {
      "roots": ["content/story"],
      "scopePolicy": "hard-with-override",
      "naming": {
        "parseMode": "dual",
        "canonicalCreate": "act-01/chapter-01/page-001.md"
      }
    }
  }
}
```

## Scope Safety

- Story operations are blocked outside story roots by default.
- Temporary scope expansion requires explicit override tokens.
- Assistant-generated writes stay approval-gated through the Review Queue.

Scope override APIs:

- `POST /api/repo/scope-overrides/start`
- `POST /api/repo/scope-overrides/stop`
- `GET /api/repo/scope-overrides/status`

## Workspace Flow

1. Open `Story` panel and refresh tree.
2. Select or create page.
3. Edit markdown content in Monaco.
4. Save page (`/api/repo/story/page/save`).
5. Use `Story Reader` for prev/next reading flow.
6. Attach story context/diff to `codex-assistant`.
7. Review and approve assistant proposals from `Review Queue`.
8. Use `Git` panel to stage/commit.

## Publish Pipeline (Preview -> Queue -> Apply)

Story markdown can be published into RepoStudio-local Payload collections (`repo-pages`, `repo-blocks`) with approval-gated apply.

1. Generate preview from Story panel (`Preview Publish`).
2. Queue preview into Review Queue (`Queue Publish`).
3. Approve/apply from Review Queue (or explicit apply endpoint).
4. Re-applying an already applied publish remains idempotent (no duplicate blocks when hash unchanged).

Trust-mode interaction:

- In `require-approval`, publish proposals stay pending until reviewed.
- In `auto-approve-all`, queued story publish proposals auto-apply immediately when scope guard allows the target path.
- Out-of-scope publish proposals remain blocked/failed with actionable remediation payloads.

New publish endpoints:

- `POST /api/repo/story/publish/preview`
- `POST /api/repo/story/publish/queue`
- `POST /api/repo/story/publish/apply`

Preview response includes:

- `pageDraft` (title/slug/sourcePath)
- `blocksDraft` (typed block list with stable hashes)
- `changedSummary` (existing hash vs next hash, block counts)
- parser warnings for unsupported markdown constructs

## Endpoints

- `GET /api/repo/story/tree`
- `GET /api/repo/story/page`
- `POST /api/repo/story/page/save`
- `POST /api/repo/story/create`
- `GET /api/repo/story/reader`
- `POST /api/repo/story/publish/preview`
- `POST /api/repo/story/publish/queue`
- `POST /api/repo/story/publish/apply`
