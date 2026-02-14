# Agent-Centric IDE PRD

## Vision

Repo Studio is a new IDE centered on using coding agents for code and repo work. Code and story are "art"—largely agent-driven. Settings and env keys are edited too, but the primary workflow is: human plans → agent executes → human reviews. Codegen as much as possible (defaults, types, clients, docs).

"Like Inngest for loops"—orchestrate agent workflows (planning, commands, story, code, diff, review).

## Roles

| Actor | Primary Actions |
|-------|-----------------|
| Human | Plan, review proposals, approve/reject, env keys, high-level settings |
| Agent | Code edits, story structure, planning artifacts, file operations |
| Codegen | Defaults, types, API clients, docs, env manifest |

## Distinctions

| Domain | Human vs Agent | Codegen |
|--------|----------------|---------|
| Code | Agent (edit, refactor) | — |
| Story | Agent (pages, structure) | Publish → Blocks |
| Planning | Agent (artifacts) | — |
| Settings | Both | Defaults, contract |
| Env | Both | Manifest, .example |
| Commands | Human triggers; agent may run | Policy defaults |
| Proposals | Human reviews | — |

## Non-Scope

- Replacing Cursor/IDE for day-to-day editing (Repo Studio is the shell *around* agent loops)
- Full LSP/IntelliSense parity with VSCode

## Alignment with Workspace/Panel Decisions

- **Loop Assistant**: Lives in panel; gets context from active workspace; can be in any workspace. Aware of active workspace (DS-09).
- **Review Queue**: Click file → Monaco with diff; one file at a time. SQLite for proposals. One queue with metadata for sub-agents (DS-10).
- **Sub-agents**: Work independently; Ralph Wiggum loops while sleeping. Single queue, metadata per proposal.

## Research Targets

- Inngest: event → function model; how it frames "orchestration"
- Cursor/Codex: agent UX patterns
- Windmill, Modal: agent + workflow UX
