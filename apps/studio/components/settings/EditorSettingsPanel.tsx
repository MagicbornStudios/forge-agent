"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { EDITOR_SETTINGS_SECTIONS } from "./ai-settings";

export function EditorSettingsPanel({
  workspaceId,
  editorId,
}: {
  workspaceId: string;
  editorId: string;
}) {
  return (
    <SettingsPanel
      scope="editor"
      sections={EDITOR_SETTINGS_SECTIONS}
      workspaceId={workspaceId}
      editorId={editorId}
    />
  );
}
