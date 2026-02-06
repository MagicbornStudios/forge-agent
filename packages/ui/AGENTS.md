# UI atoms - Agent rules

## Purpose

`@forge/ui` hosts shared shadcn primitives (Radix-based atoms). All app and shared UI should import these atoms instead of app-local copies.

## Rules

- Keep components atomic. Do not add domain logic here.
- Use `@forge/ui/lib/utils` for `cn`.
- If you add a shadcn component, export it from `packages/ui/src/index.ts`.
- Do not import from apps or domain packages.

## Registries

Shared registries live here: `@lucide-animated`, `@billingsdk`. To add a shared registry: add the URL to `components.json` under `registries`, or run `pnpm dlx shadcn@latest registry add @<name>` from `packages/ui`. To add a component from a registry: run `pnpm dlx shadcn@latest add @<namespace>/<component>` from `packages/ui` and export from `src/index.ts`.

## Third-party components (vendor CLIs)

For vendor CLIs (e.g. ElevenLabs), run the vendor's install command **from `packages/ui`** so components land in this package. Use **`pnpm dlx`** not `npx` to avoid "npx is not available". See [docs/how-to/15-shadcn-registries-and-components.mdx](../../docs/how-to/15-shadcn-registries-and-components.mdx) for full steps and troubleshooting. The **audio-player** in `packages/ui` is the shared audio player (character voice preview and other tracks); to add more ElevenLabs components, use their CLI from `packages/ui` and export from `src/index.ts`.

## Adding components

Run shadcn in this package and ensure imports point to `@forge/ui/*`.
