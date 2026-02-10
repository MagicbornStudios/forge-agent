import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "./attachment";
import { MarkdownText } from "./markdown-text";
import { ToolFallback } from "./tool-fallback";
import { TooltipIconButton } from "./tooltip-icon-button";
import { Button } from "@forge/ui/button";
import { cn } from "@forge/shared/lib/utils";
import { FeatureGate } from "../gating/FeatureGate";
import { CAPABILITIES, useEntitlements } from "../../entitlements";
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  AudioLinesIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  MicIcon,
  MicOffIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react";
import type { FC, ReactNode } from "react";

export interface ThreadProps {
  composerLeading?: ReactNode;
  composerTrailing?: ReactNode;
}

const ThreadMessages: FC = () => {
  const messageCount = useAuiState(({ thread }) => thread?.messages?.length ?? 0);

  if (messageCount === 0) return null;

  return (
    <>
      {Array.from({ length: messageCount }, (_, index) => (
        <ThreadPrimitive.MessageByIndex
          key={index}
          index={index}
          components={{
            UserMessage,
            EditComposer,
            AssistantMessage,
          }}
        />
      ))}
    </>
  );
};

export const Thread: FC<ThreadProps> = ({ composerLeading, composerTrailing }) => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
      style={{
        ["--thread-max-width" as string]: "44rem",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-[var(--panel-padding)] pt-[var(--panel-padding)]"
      >
        <AuiIf condition={({ thread }) => Boolean(thread?.isEmpty)}>
          <ThreadWelcome />
        </AuiIf>

        <ThreadMessages />

        <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mx-auto mt-auto flex w-full max-w-(--thread-max-width) flex-col gap-[var(--control-gap)] overflow-visible rounded-t-3xl pb-[var(--panel-padding)]">
          <ThreadScrollToBottom />
          <Composer composerLeading={composerLeading} composerTrailing={composerTrailing} />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-10 z-10 self-center rounded-full p-0 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-(--thread-max-width) grow flex-col">
      <div className="aui-thread-welcome-center flex w-full grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-4">
          <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in font-semibold text-2xl duration-200">
            Hello there!
          </h1>
          <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in text-muted-foreground text-xl delay-75 duration-200">
            How can I help you today?
          </p>
        </div>
      </div>
      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions grid w-full gap-[var(--control-gap)] pb-[var(--panel-padding)] @md:grid-cols-2">
      <ThreadPrimitive.Suggestions
        components={{
          Suggestion: ThreadSuggestionItem,
        }}
      />
    </div>
  );
};

const ThreadSuggestionItem: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestion-display fade-in slide-in-from-bottom-2 @md:nth-[n+3]:block nth-[n+3]:hidden animate-in fill-mode-both duration-200">
      <SuggestionPrimitive.Trigger send asChild>
        <Button
          variant="ghost"
          className="aui-thread-welcome-suggestion h-auto w-full @md:flex-col flex-wrap items-start justify-start gap-1 rounded-2xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
        >
          <span className="aui-thread-welcome-suggestion-text-1 font-medium">
            <SuggestionPrimitive.Title />
          </span>
          <span className="aui-thread-welcome-suggestion-text-2 text-muted-foreground">
            <SuggestionPrimitive.Description />
          </span>
        </Button>
      </SuggestionPrimitive.Trigger>
    </div>
  );
};

const Composer: FC<ThreadProps> = ({ composerLeading, composerTrailing }) => {
  const entitlements = useEntitlements();
  const attachmentsEnabled = entitlements.has(CAPABILITIES.STUDIO_AI_ATTACHMENTS);

  const content = (
    <>
      {attachmentsEnabled ? <ComposerAttachments /> : null}
      <ComposerPrimitive.Input
        placeholder="Send a message..."
        className="aui-composer-input mb-0 max-h-32 min-h-[calc(var(--control-height)*1.6)] w-full resize-none bg-transparent px-[var(--control-padding-x)] pt-[calc(var(--control-padding-y)+2px)] pb-[calc(var(--control-padding-y)+2px)] text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-0"
        rows={1}
        autoFocus
        aria-label="Message input"
      />
      <ComposerAction composerLeading={composerLeading} composerTrailing={composerTrailing} />
    </>
  );

  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
      {attachmentsEnabled ? (
        <ComposerPrimitive.AttachmentDropzone className="aui-composer-attachment-dropzone flex w-full flex-col rounded-2xl border border-input bg-background px-[calc(var(--control-padding-x)-2px)] pt-[calc(var(--control-padding-y)+2px)] outline-none transition-shadow has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-1 has-[textarea:focus-visible]:ring-ring/20 data-[dragging=true]:border-ring data-[dragging=true]:border-dashed data-[dragging=true]:bg-accent/50">
          {content}
        </ComposerPrimitive.AttachmentDropzone>
      ) : (
        <div className="aui-composer-attachment-dropzone flex w-full flex-col rounded-2xl border border-input bg-background px-[calc(var(--control-padding-x)-2px)] pt-[calc(var(--control-padding-y)+2px)] outline-none transition-shadow has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-1 has-[textarea:focus-visible]:ring-ring/20">
          {content}
        </div>
      )}
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC<ThreadProps> = ({ composerLeading, composerTrailing }) => {
  return (
    <div className="aui-composer-action-wrapper relative mx-[calc(var(--control-padding-x)-2px)] mb-[var(--control-padding-y)] flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <FeatureGate
          capability={CAPABILITIES.STUDIO_AI_ATTACHMENTS}
          mode="disable"
          reason="File upload is feature-flagged and currently off."
        >
          <ComposerAddAttachment />
        </FeatureGate>
        {composerLeading}
      </div>

      <div className="flex items-center gap-1.5">
        {composerTrailing}

        <FeatureGate
          capability={CAPABILITIES.STUDIO_AI_DICTATION}
          mode="disable"
          reason="Speech-to-text is feature-flagged and currently off."
        >
          <>
            <ComposerPrimitive.If dictation={false}>
              <ComposerPrimitive.Dictate asChild>
                <TooltipIconButton
                  tooltip="Start dictation"
                  side="bottom"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  aria-label="Start dictation"
                >
                  <MicIcon className="size-[var(--icon-size)]" />
                </TooltipIconButton>
              </ComposerPrimitive.Dictate>
            </ComposerPrimitive.If>
            <ComposerPrimitive.If dictation={true}>
              <ComposerPrimitive.StopDictation asChild>
                <TooltipIconButton
                  tooltip="Stop dictation"
                  side="bottom"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  aria-label="Stop dictation"
                >
                  <MicOffIcon className="size-[var(--icon-size)]" />
                </TooltipIconButton>
              </ComposerPrimitive.StopDictation>
            </ComposerPrimitive.If>
          </>
        </FeatureGate>

        <FeatureGate
          capability={CAPABILITIES.STUDIO_AI_VOICE_MODE}
          mode="disable"
          reason="Realtime voice mode is coming soon."
        >
          <TooltipIconButton
            tooltip="Voice mode"
            side="bottom"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            disabled
            aria-label="Voice mode"
          >
            <AudioLinesIcon className="size-[var(--icon-size)]" />
          </TooltipIconButton>
        </FeatureGate>

        <AuiIf condition={({ thread }) => !thread?.isRunning}>
          <ComposerPrimitive.Send asChild>
            <TooltipIconButton
              tooltip="Send message"
              side="bottom"
              type="submit"
              variant="default"
              size="icon"
              className="aui-composer-send size-8 rounded-full"
              aria-label="Send message"
            >
              <ArrowUpIcon className="aui-composer-send-icon size-[var(--icon-size-lg)]" />
            </TooltipIconButton>
          </ComposerPrimitive.Send>
        </AuiIf>
        <AuiIf condition={({ thread }) => Boolean(thread?.isRunning)}>
          <ComposerPrimitive.Cancel asChild>
            <Button
              type="button"
              variant="default"
              size="icon"
              className="aui-composer-cancel size-8 rounded-full"
              aria-label="Stop generating"
            >
              <SquareIcon className="aui-composer-cancel-icon size-3 fill-current" />
            </Button>
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </div>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-assistant-message-root fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-(--thread-max-width) animate-in py-3 duration-150"
      data-role="assistant"
    >
      <div className="aui-assistant-message-content wrap-break-word px-2 text-foreground leading-relaxed">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
            tools: { Fallback: ToolFallback },
          }}
        />
        <MessageError />
      </div>

      <div className="aui-assistant-message-footer mt-1 ml-2 flex">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={({ message }) => message.isCopied}>
            <CheckIcon />
          </AuiIf>
          <AuiIf condition={({ message }) => !message.isCopied}>
            <CopyIcon />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <TooltipIconButton
            tooltip="More"
            className="data-[state=open]:bg-accent"
          >
            <MoreHorizontalIcon />
          </TooltipIconButton>
        </ActionBarMorePrimitive.Trigger>
        <ActionBarMorePrimitive.Content
          side="bottom"
          align="start"
          className="aui-action-bar-more-content z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <ActionBarPrimitive.ExportMarkdown asChild>
            <ActionBarMorePrimitive.Item className="aui-action-bar-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              <DownloadIcon className="size-[var(--icon-size)]" />
              Export as Markdown
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.ExportMarkdown>
        </ActionBarMorePrimitive.Content>
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-user-message-root fade-in slide-in-from-bottom-1 mx-auto grid w-full max-w-(--thread-max-width) animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 py-3 duration-150 [&:where(>*)]:col-start-2"
      data-role="user"
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content wrap-break-word rounded-2xl bg-muted px-4 py-2.5 text-foreground">
          <MessagePrimitive.Parts />
        </div>
        <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-0">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root className="aui-edit-composer-wrapper mx-auto flex w-full max-w-(--thread-max-width) flex-col px-2 py-3">
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-[85%] flex-col rounded-2xl bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent p-4 text-foreground text-sm outline-none"
          autoFocus
        />
        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm">Update</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-muted-foreground text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

