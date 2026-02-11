"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { useSettingsRegistrySections } from "@/lib/editor-registry/settings-registry";

export function ViewportSettingsPanel({
  editorId,
  viewportId,
}: {
  editorId: string;
  viewportId: string;
}) {
  const scopeId = `${editorId}:${viewportId}`;
  const sections = useSettingsRegistrySections("viewport", scopeId);
  return (
    <SettingsPanel
      scope="viewport"
      sections={sections}
      editorId={editorId}
      viewportId={viewportId}
    />
  );
}
