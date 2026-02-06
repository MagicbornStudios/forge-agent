---
title: Features
---

# Features

## Unified workspace

One app shell hosts multiple workspaces. Each workspace has its own editor type (graph, timeline, etc.) and domain logic. Only the active workspace is rendered, so you get a focused experience without losing the ability to switch context.

## AI in context

The in-app copilot has access to:

- The active workspace and editor type
- Your current selection (nodes, tracks, etc.)
- Draft state (unsaved changes)
- Domain actions (create node, add track, etc.)

Actions run in the client; the agent never writes to the database directly. You review and save when ready.

## Type-safe persistence

- **Payload CMS** — Collections for users, graphs, video docs, settings, and more
- **Generated types** — TypeScript types generated from your Payload schema
- **One API boundary** — The client talks only to your Next API routes and Payload REST for CRUD
- **TanStack Query** — Server state is cached and invalidated via hooks

## Billing and plans

Plans (e.g. Free, Pro) are stored on your user. Upgrade from the [Billing](/billing) page when logged in.
