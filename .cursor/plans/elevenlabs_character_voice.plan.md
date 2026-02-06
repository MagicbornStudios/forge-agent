---
name: ""
overview: ""
todos: []
isProject: false
---

# ElevenLabs character voice integration

## Scope

Add voice/audio for characters using **ElevenLabs** (OpenRouter does not offer TTS; it only supports audio *input*). Use `ELEVENLABS_API_KEY` in the character form (create + edit) to choose a voice and generate a preview.

---

## 1. Data model

- **Payload** [apps/studio/payload/collections/characters.ts](apps/studio/payload/collections/characters.ts): add optional text field `voiceId` (ElevenLabs voice_id). Admin description: "ElevenLabs voice ID for this character; used for text-to-speech preview and generation."
- **Types**: In [packages/types/src/character.ts](packages/types/src/character.ts) add `voiceId?: string | null` to `CharacterDoc`. In `CharacterPatchOp`, extend `UPDATE_CHARACTER.updates` and create-character payload to include `voiceId` where applicable.
- **Regenerate**: Run `pnpm payload:types` after changing the collection.

---

## 2. API routes (server-only, no key on client)

- **GET /api/elevenlabs/voices**
  - Reads `process.env.ELEVENLABS_API_KEY`. If missing, return 503 with a clear message.
  - Calls `GET https://api.elevenlabs.io/v1/voices` with header `xi-api-key: <key>`.
  - Returns JSON: `{ voices: Array<{ voice_id: string, name: string }> }` (or the minimal fields the UI needs). Normalize ElevenLabs response so the client only sees id + name (and optional labels).
  - Location: `apps/studio/app/api/elevenlabs/voices/route.ts`.
- **POST /api/elevenlabs/speech**
  - Body: `{ voiceId: string, text: string, modelId?: string }`. Validate required fields.
  - Calls ElevenLabs `POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}` with `xi-api-key`, body with `text` and optional `model_id` (e.g. `eleven_multilingual_v2`).
  - Returns: **binary audio** (e.g. `Content-Type: audio/mpeg`) so the client can play it, or a **base64 data URL** in JSON for simplicity (e.g. `{ audioDataUrl: "data:audio/mpeg;base64,..." }`). Prefer streaming the audio back with correct headers if easy; otherwise base64 is fine for preview.
  - Location: `apps/studio/app/api/elevenlabs/speech/route.ts`.

---

## 3. Character form – create

- **CreateCharacterModal** [apps/studio/components/character/CreateCharacterModal.tsx](apps/studio/components/character/CreateCharacterModal.tsx):
  - Add optional **Voice** section: fetch voices from `GET /api/elevenlabs/voices` on mount (or when section is expanded). Show a **Select** (or dropdown) of voice names; value is `voice_id`.
  - Optional: short **Preview** – small text input + "Play" button that calls `POST /api/elevenlabs/speech` with selected voice and that text; play the returned audio in an `<audio>` element.
  - On submit, include `voiceId` in the payload (if selected). Parent and API must accept `voiceId` when creating a character (Payload create mutation + `useCreateCharacter` hook).

---

## 4. Character form – edit

- **ActiveCharacterPanel** [apps/studio/components/character/ActiveCharacterPanel.tsx](apps/studio/components/character/ActiveCharacterPanel.tsx):
  - Extend `onUpdate` type to allow `voiceId` in updates: `Partial<Pick<CharacterDoc, 'name' | 'description' | 'imageUrl' | 'voiceId'>>`.
  - Add a **Voice** section below Description (or after portrait): same as create – dropdown of voices (from GET /api/elevenlabs/voices), current value = `character.voiceId`. Optional preview (text + Play) using POST /api/elevenlabs/speech. On voice change, call `onUpdate(character.id, { voiceId })` (and optionally debounce or save on blur).
- **CharacterWorkspace** [apps/studio/components/workspaces/CharacterWorkspace.tsx](apps/studio/components/workspaces/CharacterWorkspace.tsx): ensure `handleUpdateCharacter` and the update mutation pass `voiceId` through to the API (Payload PATCH characters).

---

## 5. Hooks and API client

- **Data hooks**: In [apps/studio/lib/data/hooks](apps/studio/lib/data/hooks) (or wherever character create/update is defined), ensure the create mutation body and update mutation body include `voiceId` when present. Payload REST accepts the new field once the collection has it.
- No need to expose ElevenLabs key to the client; all calls go through the two Next API routes.

---

## 6. Env and docs

- **.env.example**: Ensure `ELEVENLABS_API_KEY` is listed with a placeholder (e.g. `ELEVENLABS_API_KEY=sk_...`) and a one-line comment that it’s used for character voice in the character form. (User already added the key to .env.local; keep real keys out of .env.example.)
- **Docs**: Add a short note in [docs/how-to/08-adding-ai-to-workspaces.mdx](docs/how-to/08-adding-ai-to-workspaces.mdx) or in the character workspace section: "Character voice uses ElevenLabs (ELEVENLABS_API_KEY). Voice selection and preview are in the character create/edit form."

---

## Implementation order

1. Payload + types: add `voiceId` to characters collection and CharacterDoc; regenerate types; extend patch op.
2. API routes: GET voices, POST speech.
3. CreateCharacterModal: voice dropdown + optional preview; submit voiceId.
4. ActiveCharacterPanel: voice section, dropdown, preview, onUpdate(voiceId).
5. Wire workspace/hooks so create/update include voiceId.
6. .env.example + doc note.

---

## Verification

- Create character with a voice selected; character record has `voiceId` stored.
- Edit character; change voice; preview plays; save updates `voiceId`.
- If `ELEVENLABS_API_KEY` is missing, voices endpoint returns 503 and UI shows a friendly message (e.g. "Voice not configured").

