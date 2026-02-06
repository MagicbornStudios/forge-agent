---
name: ""
overview: ""
todos: []
isProject: false
---

# Centralize API via clients (no raw fetch)

## Overview

Replace direct `fetch` calls with the existing generated client where it exists (e.g. AiService for image-generate), add thin manual client modules for endpoints not in the spec, and use **ElevenLabs’ official React SDK / API client and shadcn-style components** instead of hand-rolling. Treat the **OpenAPI spec as documentation only**—agents must not be directed to extend it for new clients; prefer manual clients or vendor SDKs. Update docs so agents and humans follow this consistently.

---

## 1. OpenAPI spec is documentation only

- The OpenAPI/Swagger spec is generated for **documentation** (e.g. `/api-doc`, `/api/docs`). It does **not** support streaming, and the codebase does **not** rely on “add to OpenAPI and regenerate” as the way to add new API clients.
- **Agent rule:** Do **not** direct agents to add new endpoints to `openapi.json` to get a client. For new behavior: add a **manual client module** under `lib/api-client/`, or use a **vendor SDK** (e.g. ElevenLabs server SDK + our proxy + their React components).
- Existing generated services (Auth, Settings, Model, Ai) remain as-is for current JSON endpoints; new features use manual clients or vendor SDKs.

---

## 2. Use existing AiService for image-generate

**AiService.postApiImageGenerate** already exists. Replace direct fetch in:


| File                                                                                        | Change                                                                                                                                        |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [CharacterImageGenerator.tsx](apps/studio/components/character/CharacterImageGenerator.tsx) | Replace fetch with `AiService.postApiImageGenerate({ prompt, aspectRatio: '3:4' })`; handle `data?.imageUrl` and errors.                      |
| [AppShell.tsx](apps/studio/components/AppShell.tsx) (copilot handler)                       | Replace fetch with `AiService.postApiImageGenerate({ prompt, aspectRatio, imageSize })`; map to existing `{ success, message, data }` return. |


No new client code.

---

## 3. ElevenLabs: use their SDK and React components

Use as much of ElevenLabs’ official tooling as possible ([React SDK](https://elevenlabs.io/docs/eleven-agents/libraries/react), [API quickstart](https://elevenlabs.io/docs/eleven-api/quickstart)), and avoid reinventing the wheel.

**3a) Server (API routes)**  

- Use `**@elevenlabs/elevenlabs-js**` (or their server SDK) inside the route handlers instead of raw `fetch` to `api.elevenlabs.io`.
- **GET /api/elevenlabs/voices**: In [app/api/elevenlabs/voices/route.ts](apps/studio/app/api/elevenlabs/voices/route.ts), call the ElevenLabs client to list voices and return the same JSON shape the UI expects.
- **POST /api/elevenlabs/speech**: In [app/api/elevenlabs/speech/route.ts](apps/studio/app/api/elevenlabs/speech/route.ts), use the ElevenLabs client’s text-to-speech API; stream or return binary audio as today.  
- Keeps the API key server-side; our Next routes remain the only boundary the browser talks to.

**3b) Client (browser)**  

- Add a thin **manual client module** (e.g. `lib/api-client/elevenlabs.ts`) that calls **our** Next API (`GET /api/elevenlabs/voices`, `POST /api/elevenlabs/speech`). No fetch inside hooks or components—hooks call this module.
- [use-elevenlabs.ts](apps/studio/lib/data/hooks/use-elevenlabs.ts): `queryFn` uses the client for voices; `mutationFn` uses the client for speech and returns `{ audioUrl }` (object URL from blob). Same public contract as today.

**3c) Playback – ElevenLabs audio-player**  

- Use ElevenLabs’ **audio-player** from their shadcn-style registry for character-generated voice tracks:  
`pnpm dlx @elevenlabs/cli@latest components add audio-player`  
- Use this for “different voice tracks of audio that we generated for the character” (preview and any stored character voice clips). The repo already has an `@forge/ui` audio-player; either use ElevenLabs’ component for character voice flows or document when to use which (plan: adopt ElevenLabs’ audio-player for character voice playback where it fits).
- Document in docs that character voice playback uses ElevenLabs’ registry audio-player.

**3d) React SDK (Agents)**  

- Their `@elevenlabs/react` SDK (e.g. `useConversation`) is for **ElevenAgents** (conversational voice agents). For TTS preview and character voice we use: our proxy + thin client + their audio-player. Document that for future **conversation/agent** features we can adopt `@elevenlabs/react` (useConversation, etc.).

---

## 4. Media upload: manual client only

- Add **manual client** `lib/api-client/media.ts`: `uploadFile(file: File)` → POST `/api/media` with FormData, credentials, return `{ id, url }`. Same shape as current [use-character-media.ts](apps/studio/lib/data/hooks/use-character-media.ts).
- Hook [use-character-media.ts](apps/studio/lib/data/hooks/use-character-media.ts): mutation calls the media client; remove in-hook fetch.

---

## 5. Export and re-export

- [lib/api-client/index.ts](apps/studio/lib/api-client/index.ts): export the new modules (elevenlabs, media).
- [lib/data/studio-client.ts](apps/studio/lib/data/studio-client.ts): re-export so app and hooks use one entry point.

---

## 6. Documentation updates (so agents follow this)

**6a) [AGENTS.md](AGENTS.md) (Persistence and data layer)**  

- State: OpenAPI/Swagger spec is for **documentation only**; it does not support streaming. Do **not** direct agents to add new endpoints to the spec to get a client.
- State: Custom endpoints use the **generated** client where it already exists (Auth, Settings, Model, Ai), **manual client modules** in `lib/api-client/` (e.g. elevenlabs, media, workflows), or **vendor SDKs** (e.g. ElevenLabs server SDK + our proxy + their React/components). Do not add raw `fetch` for `/api/*` in components, hooks, or stores—**extend the client** (new module or vendor SDK) instead.

**6b) [docs/agent-artifacts/core/errors-and-attempts.md**](docs/agent-artifacts/core/errors-and-attempts.md)  

- Under “Raw fetch for API routes”: add that **new** endpoints should get a **manual client module** in `lib/api-client/` or use a **vendor SDK**; the OpenAPI spec is not for codegen-driven client generation—it is for docs only.

**6c) [docs/11-tech-stack.mdx**](docs/11-tech-stack.mdx) (and [tech-stack.md](docs/tech-stack.md) if present)  

- Clarify: OpenAPI/Swagger spec is generated for **documentation**. Custom endpoints use existing generated services where present, **manual client modules** in `lib/api-client/`, or **vendor SDKs** (e.g. ElevenLabs: server uses their SDK, client uses our thin client to our proxy, playback uses their audio-player component). Do not rely on extending the spec to add new clients.

**6d) Optional – ElevenLabs integration**  

- Add a short note (e.g. in a how-to or agent-artifacts): we proxy ElevenLabs via Next API; server uses `@elevenlabs/elevenlabs-js`; client uses our `lib/api-client/elevenlabs` module; character voice playback uses ElevenLabs’ audio-player from their registry; for future conversation/agent features we can use `@elevenlabs/react` (useConversation, etc.).

---

## 7. Out of scope

- Server-side fetch in other route handlers (OpenRouter, Resend, etc.) — unchanged.
- [workflows.ts](apps/studio/lib/api-client/workflows.ts) — remains the single place for SSE; uses fetch for streaming.
- [platform-client.ts](apps/studio/lib/data/platform-client.ts) — keep; new platform usage goes through it.
- apps/marketing — separate app; optional later alignment.

---

## Summary of file changes


| Action                    | File                                                                                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use AiService             | [CharacterImageGenerator.tsx](apps/studio/components/character/CharacterImageGenerator.tsx), [AppShell.tsx](apps/studio/components/AppShell.tsx)                           |
| Server: ElevenLabs SDK    | [app/api/elevenlabs/voices/route.ts](apps/studio/app/api/elevenlabs/voices/route.ts), [app/api/elevenlabs/speech/route.ts](apps/studio/app/api/elevenlabs/speech/route.ts) |
| Client: elevenlabs module | New `lib/api-client/elevenlabs.ts`; [use-elevenlabs.ts](apps/studio/lib/data/hooks/use-elevenlabs.ts) uses it                                                              |
| Client: media module      | New `lib/api-client/media.ts`; [use-character-media.ts](apps/studio/lib/data/hooks/use-character-media.ts) uses it                                                         |
| Export                    | [lib/api-client/index.ts](apps/studio/lib/api-client/index.ts), [studio-client.ts](apps/studio/lib/data/studio-client.ts)                                                  |
| ElevenLabs audio-player   | Install via `pnpm dlx @elevenlabs/cli@latest components add audio-player`; use for character voice tracks                                                                  |
| Docs                      | [AGENTS.md](AGENTS.md), [errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md), [11-tech-stack.mdx](docs/11-tech-stack.mdx), optional ElevenLabs note  |


Risk: Low. Image-generate is a direct swap to AiService; ElevenLabs server refactor uses official SDK; new client modules are additive; docs clarify behavior for agents.