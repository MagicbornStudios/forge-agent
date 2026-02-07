---
created: 2026-02-04
updated: 2026-02-07
---

# Contributor workspaces

Community modes live here. We expect every new contributor to build their own editor mode and add it here via a PR.

## How to contribute a mode

1. **Build a mode** using the repo how-tos: start with [05 - Building a workspace](../../../docs/how-to/05-building-a-workspace.mdx) (and optionally [06 - DialogueMode walkthrough](../../../docs/how-to/06-forge-workspace-walkthrough.mdx) or [09 - VideoMode walkthrough](../../../docs/how-to/09-twick-workspace.mdx)).
2. **Implement your mode** (shell, slots, domain contract, optional AI actions).
3. **Open a PR** that adds a subfolder under this directory, e.g. `contributor_workspaces/my-awesome-mode/`, with your mode code and a **README** that describes what it does and how to run it.

We'll review and merge; once wired into the app shell (in a follow-up), your mode will be part of the showcase.
