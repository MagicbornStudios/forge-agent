---
title: Task breakdown — MCP Studio and editors (chat-first)
created: 2026-02-09
updated: 2026-02-09
---

# Task breakdown: MCP Studio and editors (chat-first)

Initiative: **mcp-apps** (Studio and editors as MCP). See [product roadmap](../../roadmap/product.mdx) § Studio and editors as MCP, [07 - Editors as MCP Apps](../../architecture/07-modes-as-mcp-apps.mdx), [11 - MCP vs CopilotKit and assistant-ui](../../architecture/11-mcp-copilotkit-assistant-ui.mdx), [12 - MCP hosts and chat-first](../../architecture/12-mcp-hosts-and-chat-first.mdx).

## Lanes

### Lane 1: Studio MCP Server and app tools

- Implement Studio MCP Server (Node or edge).
- Expose app tools: `studio_switchEditor`, `studio_openEditor`, `studio_closeEditor`, `studio_getProject`, `studio_listProjects`, `studio_publish`, `studio_updateListing`.
- Reference: [AppShell](../../apps/studio/components/AppShell.tsx), [CreateListingSheet](../../apps/studio/components/listings/CreateListingSheet.tsx), [use-listings](../../apps/studio/lib/data/hooks/use-listings.ts), [app-shell store](../../apps/studio/lib/app-shell/store.ts).

### Lane 2: Editor registration and per-editor McpAppDescriptor

- Define `McpAppDescriptor` (id, name, tools, uiResources) and registration contract.
- Registry (app shell or MCP server) where descriptors are registered; Studio MCP Server aggregates them.
- Each built-in editor (Dialogue, Character, Video, Strategy) exports a descriptor and registers.
- Align with [editor metadata](../../packages/shared/src/shared/components/editor/README.md) and [AppShell](../../apps/studio/components/AppShell.tsx) editor list.
- Third-party editors: same contract per [Developer program](../../business/developer-program-and-editors.mdx).

### Lane 3: CopilotKit/assistant-ui alignment (caveats doc + optional unified backend)

- Doc 11 already records two control planes, auth, and possible solutions (unified backend, MCP-as-transport, keep CopilotKit for in-Studio).
- Optional implementation: shared domain layer called by both CopilotKit actions and MCP tools to avoid drift.
- Keep tool naming and context shape consistent where possible.

### Lane 4: Host integration docs and setup guides

- Host matrix (Cursor, Claude, VS Code, ChatGPT, Atlas, Perplexity) — doc 12.
- Per-host setup: how to add Forge/Studio MCP server (config, env, auth).
- Future: "Quick start for Cursor" and "Quick start for Claude" guides.
- Reference distribution pattern: [vendor/twick MCP agent](../../vendor/twick/packages/agents/mcp-agent/).

---

## Task tiers

Tasks will be added here as slices are broken down (Tier 2/3). Pick from STATUS § Next #11 or this breakdown when implementing.
