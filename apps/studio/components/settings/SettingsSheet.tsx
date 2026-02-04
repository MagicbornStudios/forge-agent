"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { SettingsScope } from "@/lib/settings/store";
import { AppSettingsPanel } from "./AppSettingsPanel";
import { WorkspaceSettingsPanel } from "./WorkspaceSettingsPanel";
import { EditorSettingsPanel } from "./EditorSettingsPanel";

const SCOPE_LABELS: Record<SettingsScope, string> = {
  app: "App settings",
  workspace: "Workspace settings",
  editor: "Editor settings",
};

export interface SettingsSheetProps {
  scope: SettingsScope;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  editorId?: string;
}

export function SettingsSheet({
  scope,
  open,
  onOpenChange,
  workspaceId,
  editorId,
}: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{SCOPE_LABELS[scope]}</SheetTitle>
          <SheetDescription>
            {scope === "app" && "Global defaults used by all workspaces and editors."}
            {scope === "workspace" && "Overrides for this workspace. Unset values inherit from app."}
            {scope === "editor" && "Overrides for this editor. Unset values inherit from workspace."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {scope === "app" && <AppSettingsPanel />}
          {scope === "workspace" && workspaceId && (
            <WorkspaceSettingsPanel workspaceId={workspaceId} />
          )}
          {scope === "editor" && workspaceId && editorId && (
            <EditorSettingsPanel workspaceId={workspaceId} editorId={editorId} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
