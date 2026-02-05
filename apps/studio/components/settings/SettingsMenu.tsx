"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { WorkspaceButton } from "@forge/shared/components/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@forge/ui/dropdown-menu";
import type { SettingsScope } from "@/lib/settings/store";
import { SettingsSheet } from "./SettingsSheet";

export interface SettingsMenuProps {
  workspaceId?: string;
  editorId?: string;
  defaultScope?: SettingsScope;
  tooltip?: React.ReactNode;
}

const scopeLabels: Record<SettingsScope, string> = {
  app: "App settings",
  workspace: "Workspace settings",
  editor: "Editor settings",
};

export function SettingsMenu({
  workspaceId,
  editorId,
  defaultScope = "workspace",
  tooltip = "Settings",
}: SettingsMenuProps) {
  const [scope, setScope] = React.useState<SettingsScope>(defaultScope);
  const [open, setOpen] = React.useState(false);

  const openForScope = (next: SettingsScope) => {
    setScope(next);
    setOpen(true);
  };

  const scopes = React.useMemo(() => {
    const list: SettingsScope[] = ["app"];
    if (workspaceId) list.push("workspace");
    if (workspaceId && editorId) list.push("editor");
    return list;
  }, [workspaceId, editorId]);

  React.useEffect(() => {
    if (!scopes.includes(scope)) {
      setScope(scopes[0]);
    }
  }, [scope, scopes]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <WorkspaceButton variant="ghost" size="sm" tooltip={tooltip}>
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </WorkspaceButton>
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
        workspaceId={workspaceId}
        editorId={editorId}
      />
    </>
  );
}
