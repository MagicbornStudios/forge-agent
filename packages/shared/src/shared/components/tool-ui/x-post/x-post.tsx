"use client";

import * as React from "react";
import { BadgeCheck, Heart, MessageCircle, Share } from "lucide-react";
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
  formatCount,
  getDomain,
} from "../shared";
import type { XPostData, XPostMedia, XPostLinkPreview } from "./schema";

export interface XPostProps {
  post: XPostData;
  className?: string;
  onAction?: (action: string, post: XPostData) => void;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="size-10 shrink-0 rounded-full object-cover"
    />
  );
}

function XLogo({ className }: { className?: string }) {
  return <MessageCircle className={className} role="img" aria-label="X (formerly Twitter) logo" />;
}

function VerifiedBadge({ className }: { className?: string }) {
  return <BadgeCheck className={className} role="img" aria-label="Verified account" />;
}

function AuthorInfo({
  name,
  handle,
  verified,
  createdAt,
}: {
  name: string;
  handle: string;
  verified?: boolean;
  createdAt?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="truncate font-semibold">{name}</span>
      {verified && (
        <VerifiedBadge className="size-[18px] shrink-0 text-blue-500" />
      )}
      <span className="text-muted-foreground truncate">@{handle}</span>
      {createdAt && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {formatRelativeTime(createdAt)}
          </span>
        </>
      )}
    </div>
  );
}

function PostBody({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="text-[15px] leading-normal text-pretty wrap-break-word whitespace-pre-wrap">
      {text}
    </p>
  );
}

function PostMedia({
  media,
  onOpen,
}: {
  media: XPostMedia;
  onOpen?: () => void;
}) {
  const aspectRatio =
    media.aspectRatio === "1:1"
      ? "1"
      : media.aspectRatio === "4:3"
        ? "4/3"
        : "16/9";

  return (
    <Button
      type="button"
      variant="ghost"
      className="mt-2 w-full overflow-hidden rounded-xl bg-muted hover:bg-muted"
      style={{ aspectRatio }}
      onClick={() => onOpen?.()}
    >
      {media.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={media.alt}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <video
          src={media.url}
          controls
          playsInline
          className="size-full object-contain"
        />
      )}
    </Button>
  );
}

function PostLinkPreview({ preview }: { preview: XPostLinkPreview }) {
  const domain = preview.domain ?? getDomain(preview.url);

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-muted/50 mt-2 block overflow-hidden rounded-xl border transition-colors"
    >
      {preview.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.imageUrl}
          alt=""
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-3">
        {domain && (
          <div className="text-muted-foreground text-xs">{domain}</div>
        )}
        {preview.title && (
          <div className="font-medium text-pretty">{preview.title}</div>
        )}
        {preview.description && (
          <div className="text-muted-foreground line-clamp-2 text-sm text-pretty">
            {preview.description}
          </div>
        )}
      </div>
    </a>
  );
}

function QuotedPostCard({ post }: { post: XPostData }) {
  return (
    <div className="hover:bg-muted/30 mt-2 rounded-xl border p-3 transition-colors">
      <div className="flex min-w-0 items-center gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.author.avatarUrl}
          alt={`${post.author.name} avatar`}
          width={16}
          height={16}
          className="size-4 rounded-full object-cover"
        />
        <span className="truncate font-semibold">{post.author.name}</span>
        {post.author.verified && (
          <VerifiedBadge className="size-3.5 shrink-0 text-blue-500" />
        )}
        <span className="text-muted-foreground truncate">
          @{post.author.handle}
        </span>
        {post.createdAt && (
          <>
            <span className="text-muted-foreground shrink-0">·</span>
            <span className="text-muted-foreground shrink-0">
              {formatRelativeTime(post.createdAt)}
            </span>
          </>
        )}
      </div>
      {post.text && <p className="mt-1.5">{post.text}</p>}
      {post.media && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.media.url}
          alt={post.media.alt}
          className="mt-2 rounded-lg"
        />
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  count,
  active,
  hoverColor,
  activeColor,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
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
          className={cn(
            "h-auto gap-1.5 px-2 py-1",
            hoverColor,
            active && activeColor,
          )}
          aria-label={label}
        >
          <Icon className="size-4" />
          {count !== undefined && (
            <span className="text-sm">{formatCount(count)}</span>
          )}
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
  stats?: XPostData["stats"];
  onAction: (action: string) => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="mt-3 flex items-center gap-4">
        <ActionButton
          icon={Heart}
          label="Like"
          count={stats?.likes}
          active={stats?.isLiked}
          hoverColor="hover:text-pink-500 hover:bg-pink-500/10"
          activeColor="text-pink-500 fill-pink-500"
          onClick={() => onAction("like")}
        />
        <ActionButton
          icon={Share}
          label="Share"
          hoverColor="hover:text-blue-500 hover:bg-blue-500/10"
          onClick={() => onAction("share")}
        />
      </div>
    </TooltipProvider>
  );
}

export function XPost({
  post,
  className,
  onAction,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
}: XPostProps) {
  const normalizedFooterActions = React.useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  return (
    <div
      className={cn("flex max-w-xl flex-col gap-3", className)}
      data-tool-ui-id={post.id}
      data-slot="x-post"
    >
      <article className="bg-card rounded-xl border p-3 shadow-[var(--shadow-sm)]">
        <div className="flex gap-3">
          <Avatar
            src={post.author.avatarUrl}
            alt={`${post.author.name} avatar`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <AuthorInfo
                name={post.author.name}
                handle={post.author.handle}
                verified={post.author.verified}
                createdAt={post.createdAt}
              />
              <XLogo className="text-muted-foreground/40 size-4" />
            </div>
            <PostBody text={post.text} />
            {post.media && <PostMedia media={post.media} />}
            {post.quotedPost && <QuotedPostCard post={post.quotedPost} />}
            {post.linkPreview && !post.quotedPost && (
              <PostLinkPreview preview={post.linkPreview} />
            )}
            <PostActions
              stats={post.stats}
              onAction={(action) => onAction?.(action, post)}
            />
          </div>
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

