# Repo Studio Extension Template

Copy this folder into your active project at:

`.repo-studio/extensions/<your-extension-id>/`

## Required files

- `manifest.json` (required)
- `layout.generated.json` (recommended, referenced by `layoutSpecPath`)

## Manifest contract (v1)

- `manifestVersion`: `1`
- `id`: unique extension id in the project
- `label`: display name
- `workspaceId`: workspace tab id (unique within Repo Studio)
- `workspaceKind`: `story` or `generic`
- `description`: optional text
- `layoutSpecPath`: optional relative JSON path for panel layout contract (recommended)
- `assistant.forge.aboutWorkspace`: optional context payload shown by Forge About Workspace tool
- `assistant.forge.tools`: optional Forge tools metadata

## Layout spec contract

`layout.generated.json` should include:

- `workspaceId`
- `panelSpecs[]` (`id`, `label`, `rail`)
- `mainPanelIds[]`
- `mainAnchorPanelId`

Repo Studio resolves extension layout in this order:

1. manifest-provided layout spec (`layoutSpecPath`)
2. generated in-app extension definitions (dev/transitional)
3. generic fallback

## AI-ready behavior in this slice

- Repo Studio host-renders extension workspaces from manifest metadata.
- Forge tools are merged only for the active workspace.
- `forge_open_about_workspace` is the proof tool for extension AI readiness.

## Story extension

If you want Story behavior, use:

- `workspaceId`: `story`
- `workspaceKind`: `story`

This activates the host Story workspace renderer and enables extension-provided About Workspace tool metadata.
