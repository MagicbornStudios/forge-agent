---
name: ""
overview: ""
todos: []
isProject: false
---

# Fix CopilotKit + OpenRouter and add Media Card + Generate Modal

## Overview

1. **Fix** the CopilotKit AI SDK v2/v3 error by using OpenRouter TypeScript providers.
2. **Refactor** model discovery: fetch free (and premium) models from OpenRouter API for image, video, and chat; filter correctly; keep a registry that can be dynamic or cached.
3. **Build** a declarative, reusable Media Card + Generate Modal component (Suno-style): image/video display with an action (e.g. "Animate") that opens a modal for prompts and generation (image-to-video, text-to-video, text-to-image), with results applied to the entity (character avatar, song cover, etc.). Document the design and implementation to a high standard.

---

## Part 1: OpenRouter TypeScript providers and CopilotKit fix

### Problem

`AI_UnsupportedModelVersionError`: Using `@ai-sdk/openai` v3 with OpenRouter base URL yields v3 spec models; CopilotKit's BuiltInAgent (AI SDK 5) expects v2 only.

### Fix

- Use **@openrouter/ai-sdk-provider** for the CopilotKit route. Follow the provider's **legacy / AI SDK v5** setup so the model passed to BuiltInAgent is v2-compatible.
- In [apps/studio/app/api/copilotkit/route.ts](apps/studio/app/api/copilotkit/route.ts): replace `createOpenAI` + base URL with `createOpenRouter({ apiKey, baseUrl })` (or default instance), pass `openrouter(selectedModel)` to BuiltInAgent. Keep `OpenAIAdapter` only if CopilotKit still requires it for the endpoint; align with CopilotKit + OpenRouter provider docs.
- Add dependency `@openrouter/ai-sdk-provider` in `apps/studio/package.json`.

### Agent artifacts

- Add entry to [docs/agent-artifacts/core/errors-and-attempts.md](docs/agent-artifacts/core/errors-and-attempts.md) for **AI_UnsupportedModelVersionError (v3 vs v2)** with root cause and fix (use @openrouter/ai-sdk-provider with v5/legacy path, or pin @ai-sdk/openai to 2.x).

---

## Part 2: Dynamic model list from OpenRouter (free + premium, filter by use case)

### Goal

Stop relying only on a hardcoded registry. Call OpenRouter, get models, filter by free tier and by capability (chat, image, video), and use that to drive the app’s model lists and registry.

### OpenRouter API

- **GET [https://openrouter.ai/api/v1/models**](https://openrouter.ai/api/v1/models) (with `Authorization: Bearer <OPENROUTER_API_KEY>`). Response includes per-model: id, name, pricing (prompt, completion, image, etc.), context length, **modality** (e.g. image in/out, video), supported parameters.
- **Free models:** Identify by zero pricing (e.g. `pricing.prompt === 0 && pricing.completion === 0`) or by OpenRouter’s `top_offered` / free-tier metadata if documented.
- **Filtering:** No single query param for "free only"; fetch the list and filter in our code. Filter by:
  - **Chat / general:** models that support chat/completion (and optionally tools).
  - **Image generation:** models with image output modality (or OpenRouter image pricing).
  - **Video:** models that support video output (or video-related modality) when available.

### Implementation

- **Server route:** Add `GET /api/openrouter/models` (or `/api/models/openrouter`) that:
  - Uses `OPENROUTER_API_KEY` server-side.
  - Calls OpenRouter `GET /api/v1/models`, optionally caches (in-memory or short TTL) to avoid rate limits.
  - Returns a normalized list: `{ id, name, pricing, modality, supportsTools?, supportsImage?, supportsVideo? }` with a `tier: 'free' | 'paid'` derived from pricing.
- **Model router / registry:**
  - **Option A:** Keep a static fallback list in [apps/studio/lib/model-router/registry.ts](apps/studio/lib/model-router/registry.ts) for when the API is down or key is missing; otherwise merge or replace with OpenRouter response.
  - **Option B:** Registry becomes a cache of the last successful fetch; on app load or settings load, call `/api/openrouter/models` and hydrate the registry (e.g. in model-router store or server-state). UI (ModelSwitcher, generation modals) reads from this single source.
- **Types:** Extend [apps/studio/lib/model-router/types.ts](apps/studio/lib/model-router/types.ts) so `ModelDef` can be populated from OpenRouter (id, label, tier, supportsTools, supportsImages, supportsVideo). Add a type for the raw OpenRouter model list if needed.
- **Filtering in UI:** In the media generation modal and in CopilotKit model selection, filter by:
  - **Free tier:** `tier === 'free'` (and optionally a "show paid" toggle).
  - **Use case:** chat → supportsTools; image gen → supportsImages; video gen → supportsVideo.

### Documentation

- In [docs/architecture/03-copilotkit-and-agents.mdx](docs/architecture/03-copilotkit-and-agents.mdx) and [docs/how-to/08-adding-ai-to-workspaces.mdx](docs/how-to/08-adding-ai-to-workspaces.mdx): state that model lists for chat, image, and video are derived from OpenRouter’s models API (with optional static fallback), and that we filter by tier and modality for agents and generation UIs.

---

## Part 3: Media Card + Generate Modal (Suno-style, declarative, reusable)

### Goal

A single, declarative pattern: an **entity media slot** (image or video) with an action that opens a **generation modal** (prompts + generation type). Generated media is applied back to the entity (e.g. character avatar, song cover). Reusable across “edit character”, “edit song details”, and any future entity with name + media + description.

### Reference UX (Suno)

- **Edit Song Details** modal: left = media card (image/video) with **Animate**, **Generate Cover Art**, **Update Cover Art**; right = name, caption, style summary, etc.
- Clicking **Animate** (or Generate) opens **Generate Cover Art** modal: tabs **Image to Video**, **Text to Video**, **Text to Image**; prompt field; advanced/duration; **Generate** with cost (credits); “Your generations will appear here”; async notice (“can take up to 5 minutes…”).
- Our equivalent: **edit character** (name, image/avatar, description). Media area shows current avatar (or video); **Animate** or **Generate** opens the same style modal; result applies to character’s `imageUrl` (or media field).

### Component design (declarative, shadcn-based)

**1. MediaCard (or MediaSlot)** – shared, in `packages/ui` or `packages/shared`

- **Purpose:** Display one piece of media (image or video) with optional actions overlay.
- **Props (conceptual):** `src?: string`, `alt?: string`, `type?: 'image' | 'video'`, `aspectRatio?`, `children?` (actions), `onRemove?`, `className?`. Renders a container (e.g. aspect-ratio box), an `<img>` or `<video>` when `src` is set, placeholder (initials or icon) when not, and a slot for action buttons (e.g. “Animate”, “Generate”, “Update”).
- **Implementation:** Compose shadcn `Card`, `AspectRatio`, and existing primitives. No domain logic; purely presentational. Used inside entity editors (character, future song/card, etc.).

**2. GenerateMediaModal** – app or shared

- **Purpose:** Modal for AI media generation: choose mode (image-to-video, text-to-video, text-to-image), enter prompt, optional advanced options, trigger generation, show result and “Apply” to entity.
- **Props (conceptual):** `open: boolean`, `onOpenChange`, `mode?: 'image-to-video' | 'text-to-video' | 'text-to-image'`, `sourceImageUrl?: string` (for image-to-video), `defaultPrompt?: string`, `onApply: (url: string) => void`, `entityLabel?: string` (e.g. “Character avatar”), `creditsInfo?: { balance, cost }` if we show credits. Internal state: prompt, selected model (from filtered list), loading, generated result URL.
- **Content:** Tabs for the three modes; prompt textarea; for image-to-video, show source image thumbnail with option to clear; duration/settings dropdown(s); Generate button (cost if we have credits); result area (“Your generations will appear here”) and Apply/Cancel. Use shadcn `Dialog`, `Tabs`, `Button`, `Textarea`, `Select`.
- **API:** Calls existing or new routes: text-to-image → `/api/image-generate`; text-to-video / image-to-video → new route(s) when we have OpenRouter (or provider) support for video. Model for each mode comes from the OpenRouter-derived registry (filtered by supportsImages / supportsVideo).

**3. Entity editor pattern (e.g. “Edit character”)**

- **Layout:** Same as Suno: left = MediaCard (current avatar) + actions; right = name, description, other fields.
- **Actions on MediaCard:** “Animate” (or “Generate”) opens `GenerateMediaModal`; “Update” could open file picker or link to upload. Modal’s `onApply` calls parent’s update (e.g. `onUpdate(character.id, { imageUrl })`).
- **Reuse:** One `MediaCard` + one `GenerateMediaModal`; parent passes entity-specific props (src, defaultPrompt, onApply). No duplicate modal logic per domain.

### Where components live

- **MediaCard:** In `packages/ui` as a composed primitive (e.g. `media-card.tsx`) using Card, AspectRatio, Button, so any app can use it. Alternatively in `packages/shared` if we want it next to workspace components; then it must not depend on app routes (only on @forge/ui).
- **GenerateMediaModal:** Either in `apps/studio/components` (if it calls `/api/...` and uses app-specific hooks) or in `packages/shared` with callbacks only (parent passes `onGenerateImage`, `onGenerateVideo` that perform fetch). Prefer **callbacks** so the modal stays reusable and testable; the parent (CharacterWorkspace, future SongWorkspace) wires it to `/api/image-generate` and future video APIs.

### Backend for video (when ready)

- OpenRouter (or provider) may expose video models. When we add support: new route e.g. `POST /api/video-generate` (or extend image-generate with `mode: 'video'`), use models from registry filtered by `supportsVideo`. GenerateMediaModal then calls the appropriate endpoint per tab.

### Documentation

- Add a short **design doc** (e.g. `docs/design/03-media-card-and-generate-modal.mdx` or a section in existing design) that describes:
  - **MediaCard:** purpose, props, usage (entity avatar, cover art, etc.).
  - **GenerateMediaModal:** purpose, props, tabs (image-to-video, text-to-video, text-to-image), flow (prompt → generate → apply), and how it stays declarative (parent owns entity state and API calls).
  - **Entity editor pattern:** left = media + actions, right = name/description; reuse across character, song, etc.
- Reference this from [docs/how-to/08-adding-ai-to-workspaces.mdx](docs/how-to/08-adding-ai-to-workspaces.mdx) and from [packages/shared/src/shared/components/workspace/AGENTS.md](packages/shared/src/shared/components/workspace/AGENTS.md) if the component lives in shared.

---

## Part 4: Refactor and wiring

### Character workspace

- Replace the current portrait block + “Generate Portrait” toggle + inline `CharacterImageGenerator` in [apps/studio/components/character/ActiveCharacterPanel.tsx](apps/studio/components/character/ActiveCharacterPanel.tsx) with:
  - **MediaCard** for the avatar (image; support video later if we add a video URL field).
  - **“Animate”** (or “Generate”) button that opens **GenerateMediaModal** with `defaultPrompt` from character name/description, `onApply` => `onUpdate(character.id, { imageUrl })`.
- Keep name and description editing as-is (right side). Optionally add “Update Cover” (file upload) later.

### Model switcher and settings

- ModelSwitcher and any “model for generation” dropdowns should consume the same registry that is hydrated from OpenRouter (or fallback). Filter options by context: chat (CopilotKit) → tools; image modal → supportsImages; video modal → supportsVideo; show free first, then premium if we keep a tier toggle.

### OpenRouter config and types

- Keep [apps/studio/lib/openrouter-config.ts](apps/studio/lib/openrouter-config.ts) for API key and base URL. New route that fetches models can live in `apps/studio/app/api/openrouter/models/route.ts` (or similar) and use this config. No need to change existing image-generate/structured-output to OpenRouter SDK in this plan unless we do a separate refactor; focus on CopilotKit provider + model list + UI components.

---

## Part 5: Documentation and agent artifacts

- **errors-and-attempts:** Add AI_UnsupportedModelVersionError entry (Part 1).
- **Architecture (03-copilotkit-and-agents, 01-unified-workspace):** Mention OpenRouter provider for CopilotKit; model list from OpenRouter API with filtering; optional static fallback.
- **How-to (08-adding-ai):** Describe model discovery (fetch + filter), MediaCard + GenerateMediaModal pattern, and where to plug in new entity types (character, song, etc.).
- **Design doc:** New section or file for Media Card + Generate Modal (Part 3).
- **STATUS.md:** Note completion of CopilotKit/OpenRouter fix, dynamic model list, and media component; add “Next” items if needed (e.g. video API, credits UI).

---

## Implementation order (suggested)

1. **Part 1:** CopilotKit route → @openrouter/ai-sdk-provider; fix v2/v3; document in errors-and-attempts.
2. **Part 2:** Add GET OpenRouter models route; normalize and filter (free, image, video, chat); hydrate model router/registry; extend types and docs.
3. **Part 3:** Implement MediaCard and GenerateMediaModal (shadcn, declarative); document design.
4. **Part 4:** Wire Character workspace to MediaCard + GenerateMediaModal; remove inline CharacterImageGenerator from panel.
5. **Part 5:** Final doc and STATUS pass.

---

## Verification

- CopilotKit chat runs without AI_UnsupportedModelVersionError; model selection uses OpenRouter-derived list (free/paid filtered).
- Character editor shows MediaCard with “Animate”/“Generate”; modal opens with tabs; text-to-image generates and applies to character avatar.
- Plan is self-contained and clear enough to implement and document to a high standard.

