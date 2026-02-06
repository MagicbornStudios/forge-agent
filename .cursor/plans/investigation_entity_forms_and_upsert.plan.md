---
name: ""
overview: ""
todos: []
isProject: false
---

# Investigation: Entity forms, Form vs modal, and universal upsert + delete

## Current state

### CreateCharacterModal

- **What it is:** A form (name, description, imageUrl, voice, preview) implemented with raw `useState` for every field. No `react-hook-form`. Props: `onSubmit(data)`, `onClose()`.
- **Where it’s used:** Inside CharacterWorkspace’s overlay spec: `render: ({ onDismiss }) => <CreateCharacterModal onSubmit={...} onClose={onDismiss} />`. So the **modal** is actually the `Dialog` in `WorkspaceOverlaySurface`; CreateCharacterModal is just the **content** of that dialog.
- **Edit flow:** Character edit is **inline** in `ActiveCharacterPanel` (no modal). So we have “create in overlay, edit inline” and two different UIs (modal form vs panel fields).

### CreateNodeModal

- **What it is:** A form (nodeType, label, content, speaker) using **react-hook-form** (`useForm`, `Form`, `FormField`, `FormItem`, etc.) and `ModalComponentProps` (route with payload, onClose). Create-only.
- **Where it’s used:** ForgeWorkspace overlay spec: `render: ({ payload, onDismiss }) => <CreateNodeModal route={{ ... payload }} onClose={onDismiss} onSubmit={...} />`. Same idea: Dialog is the shell; CreateNodeModal is the form content.
- **Edit flow:** Forge node edit is inline in the inspector when a node is selected. No “edit node modal.”

### Overlay vs “modal”

- **Overlay:** Declarative list `OverlaySpec[]` (id, type: 'modal', title, size, `render({ payload, onDismiss })`). `WorkspaceOverlaySurface` renders a **Dialog** (shadcn) and calls `spec.render({ payload, onDismiss })` for the body. So the **modal** is the Dialog wrapper; the **content** is whatever we pass.
- **Conclusion:** “CreateCharacterModal” and “CreateNodeModal” are misnamed: they are **forms** rendered inside the shared overlay Dialog. The modal is not a separate concept; it’s the overlay shell.

### Delete and confirmation

- **Character:** No delete-character flow in the codebase yet.
- **Relationship:** `handleDeleteRelationship` exists; no AlertDialog/confirmation found in the grep.
- **Forge node:** Delete is via operations (e.g. deleteNode); likely toolbar or context menu, no separate “delete modal.”
- **UI:** `@forge/ui` has `AlertDialog` (Radix); we can use it for “Are you sure?” confirmations.

---

## Problems (why it feels wrong)

1. **Inconsistent form approach:** CreateCharacterModal = useState soup; CreateNodeModal = react-hook-form. Same app, two patterns. CreateCharacterModal also doesn’t get validation, touched state, or a single source of truth like Form gives.
2. **Naming blur:** “Modal” in the component name suggests the component owns the modal. It doesn’t—the overlay does. So we have “modal” components that are really forms.
3. **No shared upsert pattern:** Create is overlay + form; edit is inline elsewhere. If we ever want “edit character in a modal,” we’d duplicate form fields or refactor. No single “character form” used for both create and edit.
4. **No universal delete + confirm:** Delete (where it exists) is ad hoc; no shared “delete entity X?” confirmation pattern.

---

## Recommendation: forms + overlay shell, optional universal upsert

### 1. Separate form from container

- **Form** = data, validation, submit. Uses `react-hook-form` and `Form`/`FormField` from `@forge/ui`. No “modal” in the name. Receives:
  - `defaultValues` (for create: empty/defaults; for edit: entity)
  - `onSubmit(data)`
  - `onCancel()` (so it can be used in a dialog that closes on cancel)
  - Optionally `mode: 'create' | 'edit'` if we want one component to drive title/primary button text and optional Delete.
- **Modal** = the overlay. The overlay’s `render` returns the form (or a thin wrapper). Example: `render: ({ onDismiss }) => <CharacterForm defaultValues={{}} onSubmit={...} onCancel={onDismiss} />`. No need for a component named “CreateCharacterModal”; we have **CharacterForm** and the workspace composes it inside the overlay.

### 2. Use Form for CreateCharacterModal

- Refactor the current create-character content into a **CharacterForm** that uses `useForm` and `Form`/`FormField` (like CreateNodeModal). Fields: name, description, imageUrl, voiceId, plus voice preview (can stay as a custom block with local state or a form field). Validation (e.g. required name) via Form. Then the overlay becomes: `render: ({ onDismiss }) => <CharacterForm onSubmit={...} onCancel={onDismiss} />` (defaultValues empty for create).
- This fixes inconsistency and gives one pattern: **all entity forms use react-hook-form**.

### 3. Universal upsert (one form, create or edit)

- **Character:** One **CharacterForm** with:
  - `defaultValues?: Partial<CharacterDoc>` (optional; when absent or empty, treat as create).
  - `mode?: 'create' | 'edit'` (or infer from “do we have an id?”). In edit mode we can show a “Delete” button.
  - `onSubmit(data)`, `onCancel()`, and in edit mode `onDelete?()`. When user clicks Delete, show AlertDialog “Delete this character?” → confirm → `onDelete(id)`; parent closes overlay and refetches.
- **Usage:** Create = overlay with `CharacterForm` defaultValues empty, mode create. Edit = overlay with `CharacterForm` defaultValues = character, mode edit, onDelete = delete mutation + dismiss. We can keep **edit inline** in ActiveCharacterPanel as-is, or later switch to “edit in overlay” using the same CharacterForm.
- **Node (Forge):** Same idea: **NodeForm** (or ForgeNodeForm) with defaultValues and mode create/edit, optional onDelete for edit. CreateNodeModal becomes “overlay that renders NodeForm with create defaults.”

So yes: **a single “form” per entity type that can do create or edit (upsert), plus delete with confirmation**, is a good universal pattern. The “modal” is just the overlay Dialog that wraps that form when we want it in a dialog.

### 4. Delete + confirmation (universal)

- **Pattern:** In edit mode, form (or a small wrapper) shows a “Delete” button. On click, open **AlertDialog** (“Delete [entity name]? This cannot be undone.”) with Cancel / Delete. On confirm, call `onDelete(id)`; parent runs delete mutation and dismisses overlay. Use `AlertDialog` from `@forge/ui` so the pattern is consistent.
- We can add a small shared helper or example (e.g. “DeleteButtonWithConfirm”) that takes label, onConfirm, and renders button + AlertDialog, so every entity form doesn’t reimplement the same dialog.

### 5. CreateNodeModal “weirdness”

- It’s tied to `ModalComponentProps` (route, onClose) and is create-only. Suggested direction:
  - Extract **NodeForm** (or ForgeNodeForm): form only, with `defaultValues` (from payload or selected node), `onSubmit`, `onCancel`. Use react-hook-form.
  - Overlay render: `render: ({ payload, onDismiss }) => <NodeForm defaultValues={payload} onSubmit={...} onCancel={onDismiss} />`. No need to pass “route” into the form; we only need payload as defaultValues and onClose as onCancel.
  - If we later add “edit node in modal,” same NodeForm with defaultValues = selected node and mode edit, optional onDelete.

---

## Summary


| Topic                          | Finding                                                                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form vs modal**              | The “modal” is the overlay Dialog. CreateCharacterModal / CreateNodeModal are really **forms** rendered inside it. Naming should reflect that (e.g. CharacterForm, NodeForm).                                               |
| **Use Form (react-hook-form)** | Yes. CreateCharacterModal should be refactored to use `Form`/`FormField` like CreateNodeModal for consistency, validation, and single source of truth.                                                                      |
| **CRUD / upsert**              | A single form per entity that supports both create and edit (upsert), with optional Delete + AlertDialog in edit mode, is a good universal pattern. Modal = overlay shell that wraps that form when we want it in a dialog. |
| **Delete + confirmation**      | Use `AlertDialog` from `@forge/ui` for “Are you sure?” and a consistent pattern (e.g. Delete button in edit mode → confirm → onDelete).                                                                                     |


**Suggested next steps (for a later plan or implementation):**

1. Refactor create-character content into **CharacterForm** using react-hook-form; overlay renders CharacterForm with onSubmit/onCancel.
2. Optionally add **mode** and **defaultValues** to CharacterForm for upsert; add Delete + AlertDialog in edit mode.
3. Extract **NodeForm** from CreateNodeModal; overlay renders NodeForm; optionally add edit mode + delete.
4. Introduce a small reusable **DeleteButtonWithConfirm** (or use AlertDialog directly in each form) so delete confirmation is consistent across entities.

