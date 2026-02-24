"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { useSettingsRegistrySections } from "@/lib/workspace-registry/settings-registry";

export function ViewportSettingsPanel({
  workspaceId,
  viewportId,
}: {
  workspaceId: string;
  viewportId: string;
}) {
  const scopeId = `${workspaceId}:${viewportId}`;
  const sections = useSettingsRegistrySections("viewport", scopeId);
  return (
    <SettingsPanel
      scope="viewport"
      sections={sections}
      workspaceId={workspaceId}
      viewportId={viewportId}
    />
  );
}
