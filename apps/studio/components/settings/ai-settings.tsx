"use client";

/**
 * Settings sections are derived from the single schema (lib/settings/schema.ts).
 * Re-export here so UI components can import from this file; add new keys in the schema only.
 */
export {
  APP_SETTINGS_SECTIONS,
  PROJECT_SETTINGS_SECTIONS,
  EDITOR_SETTINGS_SECTIONS,
  VIEWPORT_SETTINGS_SECTIONS,
} from "@/lib/settings/schema";
