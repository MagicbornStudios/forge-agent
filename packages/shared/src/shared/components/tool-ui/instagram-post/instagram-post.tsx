"use client";

import * as React from "react";
import { BadgeCheck, Camera, Heart, Share } from "lucide-react";
import {
  cn,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./_adapter";
import {
  ActionButtons,
  normalizeActionsConfig,
  type ActionsProp,
  formatRelativeTime,
} from "../shared";
import type { InstagramPostData, InstagramPostMedia } from "./schema";

export interface InstagramPostProps {
  post: InstagramPostData;
  className?: string;
  onAction?: (action: string, post: InstagramPostData) => void;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

function InstagramLogo({ className }: { className?: string }) {
  return <Camera className={className} role="img" aria-label="Instagram logo" />;
}

function Header({
  author,
  createdAt,
}: {
  author: InstagramPostData["author"];
  createdAt?: string;
}) {
  return (
    <header className="flex items-center gap-3 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={author.avatarUrl}
        alt={`${author.name} avatar`}
        width={32}
        height={32}
        className="size-8 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-sm font-semibold">{author.handle}</span>
        {author.verified && (
          <BadgeCheck
            aria-label="Verified"
            className="size-3.5 shrink-0 text-sky-500"
          />
        )}
        {createdAt && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground text-sm">
              {formatRelativeTime(createdAt)}
            </span>
          </>
        )}
      </div>
      <InstagramLogo className="size-5" />
    </header>
  );
}

function MediaGrid({
  media,
  onOpen,
}: {
  media: InstagramPostMedia[];
  onOpen?: (index: number) => void;
}) {
  if (media.length === 0) return null;

  const renderItem = (item: InstagramPostMedia, index: number) => (
    <Button
      key={index}
      type="button"
      variant="ghost"
      className="relative block size-full overflow-hidden rounded-none bg-muted hover:bg-muted"
      onClick={() => onOpen?.(index)}
    >
      {item.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.alt}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <video src={item.url} playsInline className="size-full object-cover" />
      )}
    </Button>
  );

  if (media.length === 1) {
    return (
      <div className="aspect-square w-full overflow-hidden">
        {renderItem(media[0], 0)}
      </div>
    );
  }

  if (media.length === 2) {
    return (
      <div className="grid aspect-square w-full grid-cols-2 gap-0.5 overflow-hidden">
        {media.map(renderItem)}
      </div>
    );
  }

  if (media.length === 3) {
    return (
      <div className="grid aspect-square w-full grid-cols-2 gap-0.5 overflow-hidden">
        <div className="h-full">{renderItem(media[0], 0)}</div>
        <div className="grid h-full grid-rows-2 gap-0.5">
          {media.slice(1).map((item, i) => (
            <div key={i + 1} className="h-full">
              {renderItem(item, i + 1)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid aspect-square w-full grid-cols-2 gap-0.5 overflow-hidden">
      {media.slice(0, 4).map((item, index) => (
        <div key={index} className="relative h-full w-full">
          {renderItem(item, index)}
          {index === 3 && media.length > 4 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-2xl font-semibold text-white">
                +{media.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PostBody({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <span className="text-sm leading-relaxed text-pretty wrap-break-word whitespace-pre-wrap">
      {text}
    </span>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  hoverColor,
  activeColor,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  hoverColor: string;
  activeColor?: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn("h-auto", hoverColor, active && activeColor)}
          aria-label={label}
        >
          <Icon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function PostActions({
  stats,
  onAction,
}: {
  stats?: InstagramPostData["stats"];
  onAction: (action: string) => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        <ActionButton
          icon={Heart}
          label="Like"
          active={stats?.isLiked}
          hoverColor="hover:opacity-60"
          activeColor="text-red-500 fill-red-500"
          onClick={() => onAction("like")}
        />
        <ActionButton
          icon={Share}
          label="Share"
          hoverColor="hover:opacity-60"
          onClick={() => onAction("share")}
        />
      </div>
    </TooltipProvider>
  );
}

export function InstagramPost({
  post,
  className,
  onAction,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
}: InstagramPostProps) {
  const normalizedFooterActions = React.useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  return (
    <div
      className={cn("flex max-w-xl flex-col gap-3", className)}
      data-tool-ui-id={post.id}
      data-slot="instagram-post"
    >
      <article className="bg-card overflow-hidden rounded-lg border shadow-[var(--shadow-sm)]">
        <Header author={post.author} createdAt={post.createdAt} />

        {post.media && post.media.length > 0 && (
          <MediaGrid media={post.media} />
        )}

        <div className="flex flex-col gap-2 p-3">
          <PostActions
            stats={post.stats}
            onAction={(action) => onAction?.(action, post)}
          />
          {post.text && (
            <div>
              <span className="text-sm font-semibold">
                {post.author.handle}
              </span>{" "}
              <PostBody text={post.text} />
            </div>
          )}
        </div>
      </article>

      {normalizedFooterActions && (
        <div className="@container/actions">
          <ActionButtons
            actions={normalizedFooterActions.items}
            align={normalizedFooterActions.align}
            confirmTimeout={normalizedFooterActions.confirmTimeout}
            onAction={(id) => onResponseAction?.(id)}
            onBeforeAction={onBeforeResponseAction}
          />
        </div>
      )}
    </div>
  );
}

