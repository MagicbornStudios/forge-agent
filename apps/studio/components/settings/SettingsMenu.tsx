"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { EditorButton } from "@forge/shared/components/editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@forge/ui/dropdown-menu";
import type { SettingsScope } from "@/lib/settings/store";
import { SettingsSheet } from "./SettingsSheet";

export interface SettingsMenuProps {
  editorId?: string;
  viewportId?: string;
  defaultScope?: SettingsScope;
  tooltip?: React.ReactNode;
}

const scopeLabels: Record<SettingsScope, string> = {
  app: "App settings",
  editor: "Editor settings",
  viewport: "Viewport settings",
};

export function SettingsMenu({
  editorId,
  viewportId,
  defaultScope,
  tooltip = "Settings",
}: SettingsMenuProps) {
  const resolvedDefaultScope =
    defaultScope ?? (viewportId ? "viewport" : editorId ? "editor" : "app");
  const [scope, setScope] = React.useState<SettingsScope>(resolvedDefaultScope);
  const [open, setOpen] = React.useState(false);

  const openForScope = (next: SettingsScope) => {
    setScope(next);
    setOpen(true);
  };

  const scopes = React.useMemo(() => {
    const list: SettingsScope[] = ["app"];
    if (editorId) list.push("editor");
    if (editorId && viewportId) list.push("viewport");
    return list;
  }, [editorId, viewportId]);

  React.useEffect(() => {
    if (!scopes.includes(scope)) {
      setScope(scopes[0]);
    }
  }, [scope, scopes]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EditorButton variant="ghost" size="sm" tooltip={tooltip}>
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </EditorButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {scopes.map((scopeOption) => (
            <DropdownMenuItem key={scopeOption} onSelect={() => openForScope(scopeOption)}>
              {scopeLabels[scopeOption]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsSheet
        scope={scope}
        open={open}
        onOpenChange={setOpen}
        editorId={editorId}
        viewportId={viewportId}
      />
    </>
  );
}
