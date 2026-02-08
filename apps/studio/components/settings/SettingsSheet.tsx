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
import { ProjectSettingsPanel } from "./ProjectSettingsPanel";
import { EditorSettingsPanel } from "./EditorSettingsPanel";
import { ViewportSettingsPanel } from "./ViewportSettingsPanel";
import { toast } from "sonner";
import { SettingsService } from "@/lib/api-client";

const SCOPE_LABELS: Record<SettingsScope, string> = {
  app: "App settings",
  project: "Project settings",
  editor: "Editor settings",
  viewport: "Viewport settings",
};

export interface SettingsSheetProps {
  scope: SettingsScope;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorId?: string;
  viewportId?: string;
  projectId?: string;
}

function getScopeId(scope: SettingsScope, editorId?: string, viewportId?: string, projectId?: string): string | null {
  if (scope === "app") return null;
  if (scope === "project" && projectId) return projectId;
  if (scope === "editor" && editorId) return editorId;
  if (scope === "viewport" && editorId && viewportId) return `${editorId}:${viewportId}`;
  return null;
}

export function SettingsSheet({
  scope,
  open,
  onOpenChange,
  editorId,
  viewportId,
  projectId,
}: SettingsSheetProps) {
  const getOverridesForScope = useSettingsStore((s) => s.getOverridesForScope);
  const [saving, setSaving] = React.useState(false);

  const handleSave = React.useCallback(async () => {
    const scopeId = getScopeId(scope, editorId, viewportId, projectId);
    if (scope !== "app" && scopeId === null) return;
    const settings = getOverridesForScope(scope, { editorId, viewportId, projectId });
    setSaving(true);
    try {
      await SettingsService.postApiSettings({
        scope,
        scopeId: scope === "app" ? null : scopeId,
        settings,
      } as Parameters<typeof SettingsService.postApiSettings>[0]);
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
  }, [scope, editorId, viewportId, projectId, getOverridesForScope]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle>{SCOPE_LABELS[scope]}</SheetTitle>
          <SheetDescription>
            {scope === "app" && "Global defaults used by all editors and viewports."}
            {scope === "project" && "Overrides for this project. Unset values inherit from app."}
            {scope === "editor" && "Overrides for this editor. Unset values inherit from app."}
            {scope === "viewport" && "Overrides for this viewport. Unset values inherit from editor."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-1 overflow-y-auto">
          {scope === "app" && <AppSettingsPanel />}
          {scope === "project" && projectId && (
            <ProjectSettingsPanel projectId={projectId} />
          )}
          {scope === "editor" && editorId && <EditorSettingsPanel editorId={editorId} />}
          {scope === "viewport" && editorId && viewportId && (
            <ViewportSettingsPanel editorId={editorId} viewportId={viewportId} />
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
