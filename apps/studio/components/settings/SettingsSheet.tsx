"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@forge/ui/sheet";
import { Button } from "@forge/ui/button";
import { useSettingsStore, type SettingsScope } from "@/lib/settings/store";
import { AppSettingsPanel } from "./AppSettingsPanel";
import { WorkspaceSettingsPanel } from "./WorkspaceSettingsPanel";
import { EditorSettingsPanel } from "./EditorSettingsPanel";
import { toast } from "sonner";
import { SettingsService } from "@/lib/api-client";

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

function getScopeId(scope: SettingsScope, workspaceId?: string, editorId?: string): string | null {
  if (scope === "app") return null;
  if (scope === "workspace" && workspaceId) return workspaceId;
  if (scope === "editor" && workspaceId && editorId) return `${workspaceId}:${editorId}`;
  return null;
}

export function SettingsSheet({
  scope,
  open,
  onOpenChange,
  workspaceId,
  editorId,
}: SettingsSheetProps) {
  const getOverridesForScope = useSettingsStore((s) => s.getOverridesForScope);
  const [saving, setSaving] = React.useState(false);

  const handleSave = React.useCallback(async () => {
    const scopeId = getScopeId(scope, workspaceId, editorId);
    if (scope !== "app" && scopeId === null) return;
    const settings = getOverridesForScope(scope, { workspaceId, editorId });
    setSaving(true);
    try {
      await SettingsService.postApiSettings({
        scope,
        scopeId: scope === "app" ? null : scopeId,
        settings,
      });
      toast.success("Settings saved", {
        description: "Your preferences will persist after refresh.",
      });
    } catch (e) {
      toast.error("Failed to save settings", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  }, [scope, workspaceId, editorId, getOverridesForScope]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle>{SCOPE_LABELS[scope]}</SheetTitle>
          <SheetDescription>
            {scope === "app" && "Global defaults used by all workspaces and editors."}
            {scope === "workspace" && "Overrides for this workspace. Unset values inherit from app."}
            {scope === "editor" && "Overrides for this editor. Unset values inherit from workspace."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-1 overflow-y-auto">
          {scope === "app" && <AppSettingsPanel />}
          {scope === "workspace" && workspaceId && (
            <WorkspaceSettingsPanel workspaceId={workspaceId} />
          )}
          {scope === "editor" && workspaceId && editorId && (
            <EditorSettingsPanel workspaceId={workspaceId} editorId={editorId} />
          )}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-end shrink-0">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
