'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@forge/ui/sheet';
import { AppSettingsPanelContent } from './AppSettingsPanelContent';

export interface AppSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeEditorId?: string | null;
  activeProjectId?: string | null;
  viewportId?: string;
}

export function AppSettingsSheet({
  open,
  onOpenChange,
  activeEditorId,
  activeProjectId,
  viewportId = 'main',
}: AppSettingsSheetProps) {
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
        <AppSettingsPanelContent
          activeEditorId={activeEditorId}
          activeProjectId={activeProjectId}
          viewportId={viewportId}
          className="mt-4 flex-1 min-h-0"
        />
      </SheetContent>
    </Sheet>
  );
}
