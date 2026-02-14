# Analysis Loops

Standalone analysis and planning loops. No execution; no sync to main Forge Loop. Update docs iteratively; user handles handoff when ready.

| Loop | Folder | Focus |
|------|--------|-------|
| **Repo Studio** | [repo_studio_analysis/](repo_studio_analysis/) | Repo Studio app; settings; parsers; Electron; story publish |
| **Forge Env** | [forge_env_analysis/](forge_env_analysis/) | Env workspace; scoping; copy-paste; Doppler/dotenv-vault parity |
| **IDE Navigation** | [ide_navigation_analysis/](ide_navigation_analysis/) | Search; file tree; regex; git status; VSCode-like UX |
| **Docs Codegen** | [docs_codegen_analysis/](docs_codegen_analysis/) | Compile-from-code; TypeDoc; Fumadocs; settings-style descriptors |
| **Agent-Centric IDE** | [agent_centric_ide_analysis/](agent_centric_ide_analysis/) | Positioning; human vs agent roles; Inngest-like orchestration |

## Relationship

- Repo Studio Env workspace is the canonical env UI; uses forge-env doctor/reconcile APIs.
- forge_env_analysis: Env workspace gaps; Doppler/dotenv-vault aspirational.
- ide_navigation_analysis: Search, tree, scope (feeds Code/Diff/Git workspaces).
- docs_codegen_analysis: Fumadocs + TypeDoc + descriptor codegen.
- agent_centric_ide_analysis: Product framing; informs PRD and phasing.
