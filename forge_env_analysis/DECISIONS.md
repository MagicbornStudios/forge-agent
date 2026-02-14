# Forge Env Analysis Decisions

## DE-01: Separate Analysis Loop

**Decision**: Forge env has its own analysis loop (`forge_env_analysis/`), independent of repo_studio_analysis.

**Rationale**: Env concerns (scoping, copy-paste, vendor) are distinct; analysis can proceed in parallel but outcomes feed repo_studio_analysis.

## DE-02: Repo Studio Env Workspace is Canonical (no standalone portal)

**Decision**: Repo Studio Env workspace is the single env UI. We do not maintain the standalone forge-env portal. We do not embed the legacy portal.

**Rationale**: User wants one place to manage env; Repo Studio fully manages env; no second UI to maintain.

## DE-03: Copy-Paste from .env

**Decision**: Support pasting .env content (KEY=VALUE lines) into Env workspace to populate target/mode inputs.

**Rationale**: User should be able to copy .env and paste into inputs for whatever scope (local/dev/prod) and target.
