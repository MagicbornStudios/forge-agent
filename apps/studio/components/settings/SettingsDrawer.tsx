"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@forge/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@forge/ui/tabs";
import { Button } from "@forge/ui/button";
import { useSettingsStore, type SettingsScope } from "@/lib/settings/store";
import { AppSettingsPanel } from "./AppSettingsPanel";
import { ProjectSettingsPanel } from "./ProjectSettingsPanel";
import { EditorSettingsPanel } from "./EditorSettingsPanel";
import { ViewportSettingsPanel } from "./ViewportSettingsPanel";
import { toast } from "sonner";
import { SettingsService } from "@/lib/api-client";

export interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeEditorId?: string | null;
  activeProjectId?: string | null;
  viewportId?: string;
}

type TabId = "app" | "user" | "project" | "editor" | "viewport";

function getScopeAndId(
  tab: TabId,
  activeEditorId?: string | null,
  activeProjectId?: string | null,
  viewportId?: string
): { scope: SettingsScope; scopeId: string | null } {
  if (tab === "app" || tab === "user") return { scope: "app", scopeId: null };
  if (tab === "project" && activeProjectId) return { scope: "project", scopeId: activeProjectId };
  if (tab === "editor" && activeEditorId) return { scope: "editor", scopeId: activeEditorId };
  if (tab === "viewport" && activeEditorId && viewportId) {
    return { scope: "viewport", scopeId: `${activeEditorId}:${viewportId}` };
  }
  return { scope: "app", scopeId: null };
}

export function SettingsDrawer({
  open,
  onOpenChange,
  activeEditorId,
  activeProjectId,
  viewportId = "main",
}: SettingsDrawerProps) {
  const getOverridesForScope = useSettingsStore((s) => s.getOverridesForScope);
  const [activeTab, setActiveTab] = React.useState<TabId>("app");
  const [saving, setSaving] = React.useState(false);

  const handleSave = React.useCallback(async () => {
    const { scope, scopeId } = getScopeAndId(
      activeTab,
      activeEditorId,
      activeProjectId,
      viewportId
    );
    if (scope !== "app" && scopeId === null) {
      toast.error("Cannot save", { description: "This scope requires a selection." });
      return;
    }
    const ids =
      scope === "project"
        ? { projectId: scopeId ?? undefined }
        : scope === "editor"
          ? { editorId: scopeId ?? undefined }
          : scope === "viewport"
            ? { editorId: activeEditorId ?? undefined, viewportId }
            : undefined;
    const settings = getOverridesForScope(scope, ids);
    setSaving(true);
    try {
      // API supports scope 'project'; generated client types are not yet updated
      await SettingsService.postApiSettings({
        scope,
        scopeId,
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
  }, [
    activeTab,
    activeEditorId,
    activeProjectId,
    viewportId,
    getOverridesForScope,
  ]);

  const showProject = activeProjectId != null;
  const showEditor = activeEditorId != null;
  const showViewport = activeEditorId != null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[420px] sm:w-[480px] overflow-y-auto flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            App and user defaults; project and editor overrides when in context.
          </SheetDescription>
        </SheetHeader>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabId)}
          className="mt-4 flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 shrink-0">
            <TabsTrigger value="app">App</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="project" disabled={!showProject}>
              Project
            </TabsTrigger>
            <TabsTrigger value="editor" disabled={!showEditor}>
              Editor
            </TabsTrigger>
            <TabsTrigger value="viewport" disabled={!showViewport}>
              Viewport
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto mt-4 min-h-0">
            <TabsContent value="app" className="mt-0">
              <AppSettingsPanel />
            </TabsContent>
            <TabsContent value="user" className="mt-0">
              <AppSettingsPanel />
            </TabsContent>
            <TabsContent value="project" className="mt-0">
              {activeProjectId && <ProjectSettingsPanel projectId={activeProjectId} />}
            </TabsContent>
            <TabsContent value="editor" className="mt-0">
              {activeEditorId && <EditorSettingsPanel editorId={activeEditorId} />}
            </TabsContent>
            <TabsContent value="viewport" className="mt-0">
              {activeEditorId && (
                <ViewportSettingsPanel editorId={activeEditorId} viewportId={viewportId} />
              )}
            </TabsContent>
          </div>
        </Tabs>
        <div className="mt-4 pt-4 border-t flex justify-end shrink-0">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
