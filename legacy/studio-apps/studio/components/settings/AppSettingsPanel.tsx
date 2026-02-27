"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { useSettingsRegistrySections } from "@/lib/workspace-registry/settings-registry";

export function AppSettingsPanel() {
  const sections = useSettingsRegistrySections("app", null);
  return <SettingsPanel scope="app" sections={sections} />;
}
