# Analysis Loops

Standalone analysis and planning loops. **No execution; no sync to main Forge Loop.** These folders are reference only; phase execution and state live in `.planning` + GSD/Codex + Repo Studio (single Forge Loop). Update analysis docs iteratively; user handles handoff when ready.

**Why this split:** One focus per loop to avoid feature-dense monoliths. Each folder informs requirements and phase context; traceability is in `.planning/ANALYSIS-REFERENCES.md`.

| Loop | Folder | Focus | Present |
|------|--------|-------|---------|
| **Repo Studio** | [repo_studio_analysis/](repo_studio_analysis/) | Repo Studio app; settings; parsers; Electron; story publish; [Planning–Execution](repo_studio_analysis/PLANNING-EXECUTION-LOOP.md) | Yes |
| **Forge Env** | [forge_env_analysis/](forge_env_analysis/) | Env workspace; scoping; copy-paste; Doppler/dotenv-vault parity | Yes |
| **IDE Navigation** | [ide_navigation_analysis/](ide_navigation_analysis/) | Search; file tree; regex; git status; VSCode-like UX | Yes |
| **Docs Codegen** | docs_codegen_analysis/ | Compile-from-code; TypeDoc; Fumadocs; settings-style descriptors | No (planned) |
| **Agent-Centric IDE** | [agent_centric_ide_analysis/](agent_centric_ide_analysis/) | Positioning; trust scope; human vs agent roles | Yes |
| **Agent Observability** | agent_observability_analysis/ | Codex metrics: tools, searches, latency, tokens, cost | No (planned) |

## Relationship

- **Single Forge Loop:** `.planning` (ROADMAP, STATE, TASK-REGISTRY, phases) + GSD/Codex for phase execution + Repo Studio for orchestration. Analysis folders feed into .planning; they are not a separate execution track.
- Planning–Execution: GSD for planning; Repomirror Ralph loops for execution; Repo Studio orchestrates.
- Repo Studio Env workspace is the canonical env UI; uses forge-env doctor/reconcile APIs.
- forge_env_analysis: Env workspace gaps; Doppler/dotenv-vault aspirational.
- ide_navigation_analysis: Navigator; server-side search; Electron-first; no default exclude; see DECISIONS.md IN-01–IN-04.
- docs_codegen_analysis: (folder not yet present) Fumadocs + TypeDoc + descriptor codegen.
- agent_centric_ide_analysis: Product framing; trust scope (auto-approve); overnight/sub-agents.
- agent_observability_analysis: (folder not yet present) Codex turn metrics; Observability workspace; see DECISIONS.md AO-01–AO-04.
