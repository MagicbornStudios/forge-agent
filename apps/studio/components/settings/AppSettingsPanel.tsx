"use client";

import * as React from "react";
import { SettingsPanel } from "./SettingsPanel";
import { APP_SETTINGS_SECTIONS } from "./ai-settings";

export function AppSettingsPanel() {
  return <SettingsPanel scope="app" sections={APP_SETTINGS_SECTIONS} />;
}
