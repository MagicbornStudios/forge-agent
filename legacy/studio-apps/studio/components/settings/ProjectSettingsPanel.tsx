"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { PROJECT_SETTINGS_SECTIONS } from "./ai-settings";

export function ProjectSettingsPanel({ projectId }: { projectId: string }) {
  return (
    <SettingsPanel
      scope="project"
      sections={PROJECT_SETTINGS_SECTIONS}
      projectId={projectId}
    />
  );
}
