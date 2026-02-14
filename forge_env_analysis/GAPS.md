# Forge Env Gaps

Env workspace must provide full env management. Legacy portal is not used or embedded.

## High Priority (Env Workspace)

| Gap | Current | Target |
|-----|---------|--------|
| Per-key editing | Doctor only; read-only | Edit keys per target; Save/Refresh |
| Copy-paste | None | Paste .env content into target/mode inputs |
| Vendor scope | Discovery uses pnpm globs only | Include vendor/* or configurable |
| Scope visibility | Targets listed by dir | Explicit package | app | vendor | root |

## Medium Priority

| Gap | Current | Target |
|-----|---------|--------|
| Mode-scoped UI | Mode in select | Clear local vs dev vs prod per target |
| Paste from selection | N/A | Parse selected .env text and fill |
| Target tabs/sections | Single doctor output | Grouped per-target editors (like portal) |

## Resolved

- **Canonical UI**: Repo Studio Env workspace only. No standalone portal to maintain; no embed of legacy.
- **API contract**: Single target; read all keys + provenance; write by mode; validate after. See API-CONTRACT.md.

## UI Layout (TBD)

- Tabs vs cards vs accordion for targets. Default: tabs for Phase A.
