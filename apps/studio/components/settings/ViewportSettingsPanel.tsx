"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { VIEWPORT_SETTINGS_SECTIONS } from "./ai-settings";

export function ViewportSettingsPanel({
  editorId,
  viewportId,
}: {
  editorId: string;
  viewportId: string;
}) {
  return (
    <SettingsPanel
      scope="viewport"
      sections={VIEWPORT_SETTINGS_SECTIONS}
      editorId={editorId}
      viewportId={viewportId}
    />
  );
}
