---
title: Enhanced features process
---

# Enhanced features process

1. **Agent (or human)** adds an entry to [enhanced-features-backlog.md](./enhanced-features-backlog.md) with status `proposed`.
2. **Human** reviews backlog; sets status to `accepted` or `rejected`; optionally assigns priority or adds to STATUS "Next".
3. When a backlog item is set to **accepted**, add it to [STATUS.md](./STATUS.md) § Next with an **impact size** (Small / Medium / Large / Epic) so the canonical next list stays complete.
4. **Agent or human** implements when status is `accepted`; sets status to `implemented` and adds optional Link to PR/slice.

Agents must not implement proposed items until a human sets `accepted`.
