'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@forge/ui/dialog';
import { DialogueAssistantPanel } from '@/components/editors/dialogue/DialogueAssistantPanel';
import { ModelSwitcher } from '@/components/model-switcher';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AssistantChatPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * Global assistant chat popup: Dialog that renders the same assistant UI
 * (Thread + runtime) as the Dialogue drawer. Opened by Cmd+K / Ctrl+Shift+P.
 */
export function AssistantChatPopup({
  open,
  onOpenChange,
  className,
}: AssistantChatPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex min-h-[420px] max-h-[90vh] w-[min(60rem,calc(100vw-2*var(--panel-padding)))] flex-col gap-0 overflow-hidden p-0',
          'border-border/70 bg-card shadow-[var(--shadow-xl)]',
          className
        )}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Assistant chat</DialogTitle>
        <div className="flex items-center border-b bg-muted/45 px-[var(--panel-padding)] py-[var(--control-padding-y)]">
          <div className="min-w-0">
            <div className="flex items-center gap-[var(--control-gap)] text-xs font-semibold text-foreground">
              <MessageSquare className="size-[var(--icon-size)]" aria-hidden />
              Assistant
            </div>
            <p className="truncate text-[10px] text-muted-foreground">
              Command palette chat (Cmd+K / Ctrl+Shift+P)
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-background/70 p-[var(--panel-padding)]">
          <DialogueAssistantPanel
            className={cn(
              'h-full min-h-[280px]',
              '[&_.aui-thread-root]:rounded-[var(--radius-xl)]',
              '[&_.aui-thread-root]:border',
              '[&_.aui-thread-root]:border-border/60',
              '[&_.aui-thread-root]:bg-card/75',
              '[&_.aui-thread-viewport]:px-[var(--panel-padding)]',
              '[&_.aui-thread-viewport]:pt-[var(--panel-padding)]',
              '[&_.aui-thread-viewport-footer]:pb-[var(--panel-padding)]',
              '[&_.aui-thread-viewport-footer]:gap-[var(--control-gap)]',
              '[&_.aui-thread-scroll-to-bottom]:p-0',
              '[&_.aui-composer-root]:mt-[var(--control-gap)]',
              '[&_.aui-composer-attachment-dropzone]:border-border/70',
              '[&_.aui-composer-attachment-dropzone]:bg-card/80',
              '[&_.aui-composer-attachment-dropzone]:px-[var(--control-padding-x)]',
              '[&_.aui-composer-attachment-dropzone]:pt-[var(--control-padding-y)]',
              '[&_.aui-composer-input]:mb-0',
              '[&_.aui-composer-input]:px-0',
              '[&_.aui-composer-input]:text-xs',
              '[&_.aui-composer-action-wrapper]:mx-0',
              '[&_.aui-composer-action-wrapper]:mb-0',
              '[&_.aui-message-error-root]:border-destructive/70',
              '[&_.aui-message-error-root]:bg-destructive/8'
            )}
            composerTrailing={<ModelSwitcher provider="assistantUi" variant="composer" />}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
