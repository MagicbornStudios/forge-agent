# Env API Contract

API for read/write env per target. Single target per request. Used by Env workspace.

## Read: GET /api/env/target/:targetId

**Query**: `?profile=forge-loop&mode=local` (optional; default profile=forge-loop, mode=local)

**Response**:
```json
{
  "ok": true,
  "targetId": "studio",
  "profile": "forge-loop",
  "mode": "local",
  "entries": [
    {
      "key": "DATABASE_URI",
      "value": "file:./data/payload.db",
      "provenance": "target.local",
      "section": "runtime",
      "description": "Database connection URI.",
      "requiredIn": ["preview", "production"],
      "secret": true
    },
    {
      "key": "NEXT_PUBLIC_APP_URL",
      "value": "",
      "provenance": "empty",
      "section": "runtime",
      "description": "App URL.",
      "requiredIn": ["local", "preview", "production"],
      "secret": false
    }
  ],
  "scope": "app"
}
```

**Rules**:
- Return **all keys** (union of manifest entries + discovered env files), including keys with empty values. Enables .env.example setup.
- `value`: merged value for the mode; empty string if not set.
- `provenance`: source id (e.g. target.local, target.development, root.local, entry.default, empty).
- Scoped to `mode` (local, preview, production, headless). Read uses merged view for that mode.
- No masking: treat all values as plain text for now.

## Write: POST /api/env/target/:targetId

**Body**:
```json
{
  "profile": "forge-loop",
  "mode": "local",
  "values": {
    "DATABASE_URI": "file:./data/payload.db",
    "NEXT_PUBLIC_APP_URL": "http://localhost:3000"
  }
}
```

**Response** (validate after write):
```json
{
  "ok": true,
  "targetId": "studio",
  "changed": ["apps/studio/.env.local"],
  "readiness": {
    "ok": true,
    "missing": [],
    "conflicts": []
  },
  "message": "Saved and validated."
}
```

**Rules**:
- `mode` determines which file to write:
  - `local` → `.env.local`
  - `preview` → `.env.development.local`
  - `production` → `.env.production.local`
  - `headless` → no write (or same as local; TBD)
- Create file if missing.
- **Validate after write**: run doctor logic; return readiness (ok, missing, conflicts) in response.
- Single target per request.

## Mode → File Mapping

| Mode       | File                      |
|-----------|---------------------------|
| local     | .env.local                |
| preview   | .env.development.local    |
| production| .env.production.local     |
| headless  | No write (read-only)      |
