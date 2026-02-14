# Analysis Loops

Standalone analysis and planning loops. No execution; no sync to main Forge Loop. Update docs iteratively; user handles handoff when ready.

| Loop | Folder | Focus |
|------|--------|-------|
| **Repo Studio** | [repo_studio_analysis/](repo_studio_analysis/) | Repo Studio app; settings; parsers; Electron; story publish; [Planning–Execution](repo_studio_analysis/PLANNING-EXECUTION-LOOP.md) |
| **Forge Env** | [forge_env_analysis/](forge_env_analysis/) | Env workspace; scoping; copy-paste; Doppler/dotenv-vault parity |
| **IDE Navigation** | [ide_navigation_analysis/](ide_navigation_analysis/) | Search; file tree; regex; git status; VSCode-like UX |
| **Docs Codegen** | [docs_codegen_analysis/](docs_codegen_analysis/) | Compile-from-code; TypeDoc; Fumadocs; settings-style descriptors |
| **Agent-Centric IDE** | [agent_centric_ide_analysis/](agent_centric_ide_analysis/) | Positioning; trust scope; human vs agent roles |
| **Agent Observability** | [agent_observability_analysis/](agent_observability_analysis/) | Codex metrics: tools, searches, exploration, latency, tokens, cost |

## Relationship

- Planning–Execution loop: GSD for planning; Repomirror Ralph loops for execution; Repo Studio orchestrates.
- Repo Studio Env workspace is the canonical env UI; uses forge-env doctor/reconcile APIs.
- forge_env_analysis: Env workspace gaps; Doppler/dotenv-vault aspirational.
- ide_navigation_analysis: Navigator; server-side search; Electron-first; no default exclude; see DECISIONS.md IN-01–IN-04.
- docs_codegen_analysis: Fumadocs + TypeDoc + descriptor codegen.
- agent_centric_ide_analysis: Product framing; trust scope (auto-approve); overnight/sub-agents.
- agent_observability_analysis: Codex turn metrics (tools, searches, paths, latency, tokens, cost); dedicated Observability workspace; real-time; see DECISIONS.md AO-01–AO-04.
