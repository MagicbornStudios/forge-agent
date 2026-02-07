---
title: Features
---

# Features

## Unified editor shell

One app shell hosts multiple editors. Each editor has its own surface (graph, timeline, etc.) and system logic. Only the active editor is rendered, so you get a focused experience without losing the ability to switch context.

## AI in context

The in-app copilot has access to:

- The active editor and viewport type
- Your current selection (nodes, tracks, etc.)
- Draft state (unsaved changes)
- System actions (create node, add track, etc.)

Actions run in the client; the agent never writes to the database directly. You review and save when ready.

## Type-safe persistence

- **Payload CMS** - Collections for users, graphs, video docs, settings, and more
- **Generated types** - TypeScript types generated from your Payload schema
- **One API boundary** - The client talks only to your Next API routes and Payload REST for CRUD
- **TanStack Query** - Server state is cached and invalidated via hooks

## Billing and plans

Plans (e.g. Free, Pro) are stored on your user. Upgrade from the [Billing](/account/billing) page when logged in.

## Upcoming: Codebase Strategy editor

We're building a **Codebase Strategy** editor that makes agents more effective in your codebase and produces human-readable docs that help both agents and humans.

- **Agent effectiveness:** Tool guidance (search, navigate, confirm), compacting for context windows, and canonical artifacts so agents know where to look and how to avoid outdated docs.
- **Traceability:** The system can "trace itself" using agent artifacts: after making a plan, it produces artifacts (STATUS, decisions, errors-and-attempts) that any coding agent can read and follow.
- **Per-editor strategies:** Our AI can analyze your codebase and produce **per-editor strategies and plans** that you give to any coding agent (Cursor, Codex, Claude, etc.) to implement; you then refine the strategy with our copilot.
- **Copilot in the loop:** Talk to the copilot to refine strategy and iterate on plans and artifacts. Clear and benefit-led: per-editor strategies and plans from your codebase, for any coding agent. Traceable from plan to implementation.
