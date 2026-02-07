"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { EDITOR_SETTINGS_SECTIONS } from "./ai-settings";

export function EditorSettingsPanel({ editorId }: { editorId: string }) {
  return (
    <SettingsPanel
      scope="editor"
      sections={EDITOR_SETTINGS_SECTIONS}
      editorId={editorId}
    />
  );
}
