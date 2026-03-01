# Assistant runtime strategy — Forge, Codex, and unification

**Status:** Design. Informs Phase 19-04 and future AI architecture decisions.

**Purpose:** Document how we use AI in Repo Studio, the Forge vs Codex divergence, and how to unify tools and behavior while respecting distinct backends.

---

## 1. Current architecture

### Two distinct AI routes (DECISIONS)

- **Forge:** Open Router assistant — tools, general chat, domain tools; uses streamText + model registry.
- **Codex:** Coding agent; works on files via Codex SDK; never uses Open Router.

No code path mixes Codex with Open Router.

### Forge path

```
Client: contract → makeAssistantTool → body.tools in request
Route:  runForgeOpenRouterPath → buildToolSet(body.tools) → streamText(model, messages, tools)
        → LLM returns tool calls → AI SDK executes tools
Client: Same contract execute functions run via AI SDK tool loop
```

### Codex path

```
Client: contract = undefined, toolsEnabled = false (today)
Route:  runCodexPath → startCodexTurn({ prompt, messages, ... }) → Codex app-server
        → streams: text-delta, approval-request, event
        → streamFromCodexTurn forwards text-delta, approval-request, finished; event is dropped
Client: No tool execution; approval-request → data-repo-proposal → custom proposal UI
```

---

## 2. Divergence points

| Layer | Forge | Codex | Shared? |
|-------|-------|-------|---------|
| Contract creation | createRepoForgeRuntimeContract | — | ✅ Same factory |
| Client contract/tools | Passed to SharedAssistantPanel | `undefined` today | Unify |
| Schema extraction | Implicit via body.tools | Need explicit | Add helper |
| Request routing | runForgeOpenRouterPath | runCodexPath | Divergent |
| Tool delivery | body.tools → streamText | turn/start params | Different |
| Tool execution | AI SDK + makeAssistantTool | None | Add bridge |
| Approval | AI SDK / tool approvals | data-repo-proposal | Could align |

---

## 3. assistant-ui capabilities we use

| Capability | Usage |
|------------|--------|
| Thread, Composer | ✅ |
| makeAssistantTool | ✅ DomainToolsRenderer |
| useAssistantInstructions | ✅ useDomainAssistant |
| Streaming | ✅ AI SDK transport |
| Generative UI (tool render) | ✅ Plan, ApprovalCard |
| Approval UI | Partial; Codex uses custom data-repo-proposal |
| ThreadList | CodebaseAgentStrategyWorkspace only |
| Data Stream runtime | Not used |
| LangGraph runtime | Not used (LangGraph is server-side in 19-03) |

---

## 4. assistant-ui Data Stream protocol

[Data Stream Protocol](https://www.assistant-ui.com/docs/runtimes/data-stream) — standardized format for:

- Streaming text
- Tool calling with structured params/results
- State management
- Attachments
- Error handling and cancellation

**Frontend:** `useDataStreamRuntime({ api: "/api/chat" })`  
**Backend:** `createAssistantStreamResponse(controller => { ... })`

**Limitation:** Human-in-the-loop tools (approval workflows) are not supported in the data stream runtime. Use LocalRuntime or Assistant Cloud for those.

**Implication for us:**

- **Codex** already streams; we could adapt our Codex route to emit data stream format, or we keep custom mapping.
- **Forge** uses AI SDK; migrating would require backend to emit data stream instead of AI SDK stream.
- **Unification option:** If we adopt data stream as our *backend contract*, both Forge and Codex backends would emit the same format; one `useDataStreamRuntime` on the client. That gives a definitive, scalable pattern.
- **Approval:** Codex uses approval-request; data stream doesn't support human-in-the-loop. We keep custom approval for Codex or use LocalRuntime for approval-heavy flows.

---

## 5. Unification approach (Phase 19-04)

### Short term (minimal change)

1. **Pass contract for Codex** — `contract={forgeContract}`, `toolsEnabled={forgeSettings.toolsEnabled}` regardless of runtime.
2. **Tool schema helper** — `getToolSchemas(contract)` or `toolsToRequestSchema(contract)` for both paths.
3. **Codex event bridge** — In streamFromCodexTurn, handle `event.type === 'event'`; when `method === 'tool/invoke'`, write `data-domain-tool-invoke`.
4. **Client tool execution** — `useToolInvocationListener` or equivalent subscribes to stream, executes domain tools when Codex emits tool/invoke.
5. **Pass tools to Codex** — startCodexTurn accepts tools; forward when app-server and tools enabled.

### Where Codex must cooperate

- Codex app-server must emit `tool/invoke` (or similar) notifications when it wants to invoke a UI tool.
- Or: Codex accepts tool definitions in turn/start and returns tool-call events.

If Codex does not support this yet, we implement our side; tool execution for Codex waits on Codex product support.

---

## 6. Improvement patterns (from discussion)

| Improvement | Purpose |
|-------------|---------|
| Runtime bridge interface | Single abstraction: getToolSchemas(), executeTool() |
| data-domain-tool-invoke | Domain-agnostic; works for any future runtime |
| useToolInvocationListener | Single place for Codex tool execution |
| Contract.getToolSchemas() | Contract is source of truth |
| Always pass tools to Codex | Ready when Codex supports them |
| Define tool-result protocol | For tools that return values to Codex |
| Explicit exec-fallback handling | No tools when transport=exec |
| Central handleAssistantRequest | Single divergence boundary in route |

---

## 7. LangGraph role

- **Not required** for tool unification. That's a transport/event-mapping problem.
- **Use for:** Multi-step planning workflows, orchestration, checkpoints, multi-loop awareness (Phase 19-03).
- **Split:** 19-04 = runtime/tool unification; 19-03 = optional LangGraph orchestration for planning.

---

## 8. Data stream as definitive backend contract?

**Option A: Keep current (AI SDK + custom Codex bridge)**  
- Pros: Minimal change; Forge path works.  
- Cons: Two backend shapes; more custom code.

**Option B: Adopt data stream as backend contract**  
- Backend: Forge path emits `createAssistantStreamResponse`; Codex path adapts Codex events → data stream format.  
- Frontend: Single `useDataStreamRuntime`.  
- Pros: One client runtime; scalable; assistant-ui native.  
- Cons: Migration effort; approval flows need LocalRuntime or custom.

**Recommendation:** Implement Option A (19-04). Evaluate Option B when we need multi-client support, assistant-ui cloud, or a single backend contract for scale. Document in DECISIONS when we decide.

---

## 9. References

- Phase 19: [.planning/phases/19-planning-assistant-context-and-tools/](.planning/phases/19-planning-assistant-context-and-tools/)
- Plan 19-04: [19-04-PLAN.md](.planning/phases/19-planning-assistant-context-and-tools/19-04-PLAN.md)
- DECISIONS: [.planning/DECISIONS.md](.planning/DECISIONS.md)
- assistant-ui Data Stream: https://www.assistant-ui.com/docs/runtimes/data-stream
- assistant-ui react-data-stream API: https://www.assistant-ui.com/docs/api-reference/integrations/react-data-stream
