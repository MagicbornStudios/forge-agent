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

## DE-04: API Read Returns All Keys (Including Empty)

**Decision**: Read API returns all keys—manifest + discovered—including keys with no value. Enables .env.example setup and filling in missing values.

**Rationale**: User needs to see and edit keys that lack values; scope to mode (local); provenance included.

## DE-05: Write Scoped by Mode; Validate After

**Decision**: Write updates the file for the given mode (.env.local, .env.development.local, .env.production.local). API validates after write and returns readiness.

**Rationale**: Safer; single target per request; client gets immediate feedback.

## DE-06: Secrets Plain Text; Single Target

**Decision**: No masking/redaction for now. Single target per request (not batch). Validate after write returns readiness (ok, missing, conflicts).
