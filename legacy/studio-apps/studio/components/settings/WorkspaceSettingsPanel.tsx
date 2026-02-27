"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { WORKSPACE_SETTINGS_SECTIONS } from "./ai-settings";

export function WorkspaceSettingsPanel({ workspaceId }: { workspaceId: string }) {
  return (
    <SettingsPanel
      scope="workspace"
      sections={WORKSPACE_SETTINGS_SECTIONS}
      workspaceId={workspaceId}
    />
  );
}
