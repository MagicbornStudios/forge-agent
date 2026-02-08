/**
 * Single schema source for settings: keys, types, labels, defaults, and which scopes show them.
 * Derive SETTINGS_CONFIG defaults and section definitions from this so adding a key in one place
 * adds the control and the default.
 */

import { DEFAULT_MODEL_OPTIONS } from "@/lib/model-router/defaults";
import type { SettingsOption, SettingsSection } from "@/components/settings/types";

export type SettingsScopeId = "app" | "project" | "editor" | "viewport";

export interface SettingsSchemaEntry {
  key: string;
  type: "text" | "textarea" | "select" | "number" | "toggle";
  label: string;
  description?: string;
  placeholder?: string;
  options?: SettingsOption[];
  default: unknown;
  /** Which scope tabs show this key. */
  scopes: SettingsScopeId[];
}

const themeOptions: SettingsOption[] = [
  { value: "dark-fantasy", label: "Dark Fantasy" },
  { value: "darcula", label: "Darcula" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "high-contrast", label: "High Contrast" },
  { value: "light", label: "Light" },
  { value: "girly", label: "Girly" },
];
const densityOptions: SettingsOption[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
];

const modelOptions: SettingsOption[] = DEFAULT_MODEL_OPTIONS;

/** Canonical list: add or change a key here to add/update the control and default everywhere. */
export const SETTINGS_SCHEMA: SettingsSchemaEntry[] = [
  // AI – app, project, editor, viewport
  {
    key: "ai.agentName",
    type: "text",
    label: "Default agent name",
    placeholder: "Forge Assistant",
    default: "Forge Assistant",
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.instructions",
    type: "textarea",
    label: "Global instructions",
    placeholder: "Describe the assistant's role and safety rules.",
    default:
      "You are an AI assistant for a creative workspace. Use available actions to help users edit their projects.",
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.model",
    type: "select",
    label: "Default model",
    options: modelOptions,
    description: "Auto uses the router. Picking a model sets the global default.",
    default: "auto",
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.temperature",
    type: "number",
    label: "Temperature",
    placeholder: "0.2",
    description: "Lower is more deterministic. Typically 0.1 - 0.7.",
    default: 0.2,
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.toolsEnabled",
    type: "toggle",
    label: "Enable tool calls",
    default: true,
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.showAgentName",
    type: "toggle",
    label: "Show agent name in UI",
    default: true,
    scopes: ["app", "project"],
  },
  // UI – app, project, editor
  {
    key: "ui.theme",
    type: "select",
    label: "Theme",
    options: themeOptions,
    default: "dark-fantasy",
    scopes: ["app", "project", "editor"],
  },
  {
    key: "ui.density",
    type: "select",
    label: "Density",
    options: densityOptions,
    description: "Compact is optimized for editor surfaces and dense tool UIs.",
    default: "compact",
    scopes: ["app", "project", "editor"],
  },
  {
    key: "ui.toastsEnabled",
    type: "toggle",
    label: "Enable toast notifications",
    description: "Disable to silence success and error toasts across the app.",
    default: true,
    scopes: ["app", "project"],
  },
  // Editor / panel – app only (panel visibility, locked)
  {
    key: "editor.locked",
    type: "toggle",
    label: "Editor locked",
    default: false,
    scopes: ["app"],
  },
  {
    key: "panel.visible.dialogue-left",
    type: "toggle",
    label: "Dialogue left panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.dialogue-right",
    type: "toggle",
    label: "Dialogue right panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.dialogue-bottom",
    type: "toggle",
    label: "Dialogue bottom panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.character-left",
    type: "toggle",
    label: "Character left panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.character-right",
    type: "toggle",
    label: "Character right panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.video-right",
    type: "toggle",
    label: "Video right panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.video-bottom",
    type: "toggle",
    label: "Video bottom panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.strategy-left",
    type: "toggle",
    label: "Strategy left panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.strategy-right",
    type: "toggle",
    label: "Strategy right panel",
    default: true,
    scopes: ["app"],
  },
];

/** Section id from key prefix and scope (for grouping in the form). */
function sectionIdFromKey(key: string, scope: SettingsScopeId): string {
  if (key.startsWith("ai.")) {
    return scope === "app" ? "ai-core" : scope === "project" ? "project-ai" : scope === "editor" ? "editor-ai" : "viewport-ai";
  }
  if (key.startsWith("ui.")) {
    return scope === "app" ? "ui" : scope === "project" ? "project-ui" : scope === "editor" ? "editor-ui" : "viewport-ui";
  }
  return "other";
}

const SECTION_META: Record<
  string,
  { title: string; description?: string }
> = {
  "ai-core": {
    title: "AI defaults",
    description: "Global defaults for Copilot behavior and OpenRouter routing.",
  },
  ui: {
    title: "App appearance",
    description: "Global UI defaults.",
  },
  "project-ai": {
    title: "Project AI defaults",
    description: "Overrides for this project. Unset values inherit from app.",
  },
  "project-ui": {
    title: "Project appearance",
    description: "UI overrides for this project.",
  },
  "editor-ai": {
    title: "Editor AI overrides",
    description: "Overrides for this editor only. Unset values inherit from the app.",
  },
  "editor-ui": {
    title: "Editor appearance",
    description: "Editor-level appearance overrides. Unset values inherit from the app.",
  },
  "viewport-ai": {
    title: "Viewport AI overrides",
    description: "Viewport-level overrides for this editor surface.",
  },
  "viewport-ui": {
    title: "Viewport appearance",
    description: "Viewport-level UI overrides.",
  },
  panels: {
    title: "Panel visibility",
    description: "Which panels are visible by default per editor.",
  },
  other: { title: "Other", description: "" },
};

export function getAppDefaults(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const e of SETTINGS_SCHEMA) {
    if (e.scopes.includes("app")) {
      out[e.key] = e.default;
    }
  }
  return out;
}

export function getProjectDefaults(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const e of SETTINGS_SCHEMA) {
    if (e.scopes.includes("project")) {
      out[e.key] = e.default;
    }
  }
  return out;
}

export type SettingsSectionDerived = SettingsSection;

export function buildSectionsForScope(scope: SettingsScopeId): SettingsSectionDerived[] {
  const entries = SETTINGS_SCHEMA.filter((e) => e.scopes.includes(scope));
  const bySection = new Map<string, SettingsSchemaEntry[]>();
  for (const e of entries) {
    const sid = sectionIdFromKey(e.key, scope);
    if (!bySection.has(sid)) bySection.set(sid, []);
    bySection.get(sid)!.push(e);
  }
  const sectionIds = Array.from(bySection.keys()).sort();
  return sectionIds.map((sid) => {
    const fields = bySection.get(sid)!;
    const meta = SECTION_META[sid] ?? SECTION_META.other;
    return {
      id: sid,
      title: meta.title,
      description: meta.description,
      fields: fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        description: f.description,
        placeholder: f.placeholder,
        options: f.options,
      })),
    } as SettingsSectionDerived;
  });
}

/** Pre-built sections for each scope (derived from schema). */
export const APP_SETTINGS_SECTIONS = buildSectionsForScope("app");
export const PROJECT_SETTINGS_SECTIONS = buildSectionsForScope("project");
export const EDITOR_SETTINGS_SECTIONS = buildSectionsForScope("editor");
export const VIEWPORT_SETTINGS_SECTIONS = buildSectionsForScope("viewport");
