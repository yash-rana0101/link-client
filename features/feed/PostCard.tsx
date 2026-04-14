"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/date";
import { postService } from "@/services/post.service";
import type { Comment, LikeResponse, PostItem } from "@/types/post";

export type FeedSignal = "wins" | "proof" | "insights" | "jobs";

interface PostCardProps {
  post: PostItem;
  signal: FeedSignal;
  onLike: (postId: string) => Promise<LikeResponse>;
  onComment: (postId: string, content: string) => Promise<Comment>;
  isLikePending: boolean;
  isCommentPending: boolean;
}

const signalStyleMap: Record<
  FeedSignal,
  {
    label: string;
    tagClassName: string;
    highlightClassName: string;
  }
> = {
  wins: {
    label: "Verified Win",
    tagClassName: "border-trust-200 bg-trust-100 text-trust-700",
    highlightClassName: "border-trust-500 bg-trust-100/70 text-trust-800",
  },
  proof: {
    label: "Proof",
    tagClassName: "border-emerald-200 bg-emerald-100 text-emerald-700",
    highlightClassName: "border-emerald-500 bg-emerald-100/70 text-emerald-800",
  },
  insights: {
    label: "Insight",
    tagClassName: "border-sky-200 bg-sky-100 text-sky-700",
    highlightClassName: "border-sky-500 bg-sky-100/70 text-sky-800",
  },
  jobs: {
    label: "Jobs",
    tagClassName: "border-amber-200 bg-amber-100 text-amber-700",
    highlightClassName: "border-amber-500 bg-amber-100/70 text-amber-800",
  },
};

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatDateTime(value);
  }

  const elapsed = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsed < hour) {
    const minutes = Math.max(1, Math.floor(elapsed / minute));
    return `${minutes}m ago`;
  }

  if (elapsed < day) {
    const hours = Math.max(1, Math.floor(elapsed / hour));
    return `${hours}h ago`;
  }

  const days = Math.max(1, Math.floor(elapsed / day));
  if (days <= 7) {
    return `${days}d ago`;
  }

  return formatDateTime(value);
};

const buildHighlightText = (post: PostItem, signal: FeedSignal) => {
  if (signal === "wins") {
    const momentum = Math.min(99, 40 + post.likeCount + post.commentCount);
    return `${momentum}% momentum score • ${post.likeCount} endorsements • verified by trusted peers`;
  }

  if (signal === "proof") {
    return `${post.commentCount} technical notes • ${post.likeCount} validations • evidence-ready update`;
  }

  if (signal === "jobs") {
    const applications = Math.max(1, post.commentCount + post.likeCount);
    return `${applications} candidate reactions • trust-first hiring signal • network verified`;
  }

  return `${post.commentCount} thoughtful replies • ${post.likeCount} endorsements • high-signal insight`;
};

const HeartIcon = ({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20.4c-6.3-3.8-9.5-7-9.5-10.5 0-2.8 2.1-5 4.8-5 1.8 0 3.5.9 4.7 2.4 1.2-1.5 2.9-2.4 4.7-2.4 2.7 0 4.8 2.2 4.8 5 0 3.5-3.2 6.7-9.5 10.5Z" />
  </svg>
);

const CommentIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 19.5V6.6c0-1.2 1-2.1 2.1-2.1h9.8c1.2 0 2.1 1 2.1 2.1v7.6c0 1.2-1 2.1-2.1 2.1H9.8L5 19.5Z" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 4h6v6" />
    <path d="m20 4-9.7 9.7" />
    <path d="M20 14.3V17c0 1.4-1.1 2.5-2.5 2.5H7c-1.4 0-2.5-1.1-2.5-2.5V6.5C4.5 5.1 5.6 4 7 4h2.7" />
  </svg>
);

const ActionIconButton = ({
  srLabel,
  icon,
  count,
  onClick,
  disabled,
  active,
  animate,
}: {
  srLabel: string;
  icon: ReactNode;
  count?: number;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  animate?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    className={[
      "inline-flex min-w-12 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200",
      active
        ? "bg-trust-100 text-trust-700"
        : "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
      disabled ? "cursor-not-allowed opacity-60" : "",
    ].join(" ")}
  >
    <span className={animate ? "like-burst" : ""}>{icon}</span>
    {typeof count === "number" ? <span className="text-xs font-semibold">{count}</span> : null}
    <span className="sr-only">{srLabel}</span>
  </button>
);

const PostCardComponent = ({
  post,
  signal,
  onLike,
  onComment,
  isLikePending,
  isCommentPending,
}: PostCardProps) => {
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const [likeSnapshot, setLikeSnapshot] = useState<{
    baseCount: number;
    likeCount: number;
    liked: boolean;
  } | null>(null);
  const [isLikeBursting, setIsLikeBursting] = useState(false);
  const likeBurstTimeoutRef = useRef<number | null>(null);

  const authorName = post.user.name ?? post.user.email;
  const profileHref = post.user.publicProfileUrl
    ? `/in/${post.user.publicProfileUrl}`
    : null;
  const style = signalStyleMap[signal];
  const postDetailsQuery = useQuery({
    queryKey: ["post", post.id],
    queryFn: () => postService.getPost(post.id),
    enabled: showCommentBox,
    staleTime: 15_000,
  });
  const comments = postDetailsQuery.data?.comments ?? [];
  const displayLikeCount =
    likeSnapshot && likeSnapshot.baseCount === post.likeCount
      ? likeSnapshot.likeCount
      : post.likeCount;
  const isLiked = likeSnapshot?.liked ?? false;

  useEffect(() => {
    return () => {
      if (likeBurstTimeoutRef.current) {
        window.clearTimeout(likeBurstTimeoutRef.current);
      }
    };
  }, []);

  const handleCommentSubmit = async () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      return;
    }

    try {
      await onComment(post.id, trimmed);
      setComment("");
      await postDetailsQuery.refetch();
    } catch {
      setShareNotice("Comment unavailable");
      setTimeout(() => setShareNotice(""), 1600);
    }
  };

  const handleShare = async () => {
    const preview = post.content.length > 120 ? `${post.content.slice(0, 117)}...` : post.content;
    const text = `${authorName}: ${preview}`;

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setShareNotice("Copied summary");
      } catch {
        setShareNotice("Share unavailable");
      }
    } else {
      setShareNotice("Share unavailable");
    }

    setTimeout(() => setShareNotice(""), 1600);
  };

  const handleLike = async () => {
    try {
      const result = await onLike(post.id);
      setLikeSnapshot({
        baseCount: post.likeCount,
        likeCount: result.likeCount,
        liked: result.liked,
      });

      if (result.liked) {
        setIsLikeBursting(true);

        if (likeBurstTimeoutRef.current) {
          window.clearTimeout(likeBurstTimeoutRef.current);
        }

        likeBurstTimeoutRef.current = window.setTimeout(() => {
          setIsLikeBursting(false);
        }, 360);
      }
    } catch {
      setShareNotice("Reaction unavailable");
      setTimeout(() => setShareNotice(""), 1600);
    }
  };

  return (
    <Card className="rounded-2xl border-surface-300 bg-surface-100/95 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {profileHref ? (
            <Link
              href={profileHref}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-white text-sm font-semibold text-surface-700 transition-transform duration-200 hover:scale-[1.04]"
            >
              {post.user.profileImageUrl ? (
                <img
                  src={post.user.profileImageUrl}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(authorName)
              )}
            </Link>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-white text-sm font-semibold text-surface-700">
              {post.user.profileImageUrl ? (
                <img
                  src={post.user.profileImageUrl}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(authorName)
              )}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="truncate font-semibold text-surface-900 transition-colors duration-200 hover:text-trust-700"
                >
                  {authorName}
                </Link>
              ) : (
                <p className="truncate font-semibold text-surface-900">{authorName}</p>
              )}
              <span className="inline-flex items-center rounded-full border border-trust-200 bg-trust-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-trust-700">
                Verified
              </span>
            </div>
            <p className="text-xs text-surface-500">
              Trust {post.user.trustScore} • {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={[
            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
            style.tagClassName,
          ].join(" ")}
        >
          {style.label}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-surface-800">
        {post.content}
      </p>

      {post.imageUrl ? (
        <div className="overflow-hidden rounded-xl border border-surface-200 bg-surface-50">
          <img src={post.imageUrl} alt="Post attachment" className="max-h-120 w-full object-cover" />
        </div>
      ) : null}

      <p
        className={[
          "rounded-xl border px-3 py-2 text-xs font-medium",
          style.highlightClassName,
        ].join(" ")}
      >
        {buildHighlightText(post, signal)}
      </p>

      <div className="flex flex-wrap items-center gap-1 border-y border-surface-300/90 py-1">
        <ActionIconButton
          srLabel={isLikePending ? "Saving reaction" : "React to post"}
          icon={<HeartIcon active={isLiked} className="h-[1.05rem] w-[1.05rem]" />}
          count={displayLikeCount}
          onClick={handleLike}
          disabled={isLikePending}
          active={isLiked}
          animate={isLikeBursting}
        />
        <ActionIconButton
          srLabel="Open comments"
          icon={<CommentIcon className="h-[1.05rem] w-[1.05rem]" />}
          count={post.commentCount}
          onClick={() => setShowCommentBox((current) => !current)}
        />
        <ActionIconButton
          srLabel="Copy share summary"
          icon={<ShareIcon className="h-[1.05rem] w-[1.05rem]" />}
          onClick={handleShare}
        />
        {shareNotice ? <span className="text-xs text-trust-700">{shareNotice}</span> : null}
      </div>

      {showCommentBox ? (
        <div className="space-y-3 rounded-xl border border-surface-200 bg-white p-3">
          {postDetailsQuery.isLoading ? (
            <p className="text-sm text-surface-600">Loading comments...</p>
          ) : null}

          {!postDetailsQuery.isLoading && comments.length === 0 ? (
            <p className="text-sm text-surface-600">No comments yet. Start the conversation.</p>
          ) : null}

          {comments.length ? (
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {comments.map((existingComment) => {
                const commentAuthorName = existingComment.user.name ?? existingComment.user.email;
                const commentAuthorHref = existingComment.user.publicProfileUrl
                  ? `/in/${existingComment.user.publicProfileUrl}`
                  : null;

                return (
                  <div key={existingComment.id} className="flex items-start gap-2.5">
                    {commentAuthorHref ? (
                      <Link
                        href={commentAuthorHref}
                        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-[10px] font-semibold text-surface-700"
                      >
                        {existingComment.user.profileImageUrl ? (
                          <img
                            src={existingComment.user.profileImageUrl}
                            alt={commentAuthorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(commentAuthorName)
                        )}
                      </Link>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-[10px] font-semibold text-surface-700">
                        {existingComment.user.profileImageUrl ? (
                          <img
                            src={existingComment.user.profileImageUrl}
                            alt={commentAuthorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(commentAuthorName)
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 rounded-xl bg-surface-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        {commentAuthorHref ? (
                          <Link
                            href={commentAuthorHref}
                            className="truncate text-xs font-semibold text-surface-900 transition-colors duration-200 hover:text-trust-700"
                          >
                            {commentAuthorName}
                          </Link>
                        ) : (
                          <p className="truncate text-xs font-semibold text-surface-900">{commentAuthorName}</p>
                        )}
                        <span className="shrink-0 text-[11px] text-surface-500">
                          {formatRelativeTime(existingComment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-surface-700">
                        {existingComment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a comment"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleCommentSubmit()}
              disabled={isCommentPending || !comment.trim()}
            >
              {isCommentPending ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
};

export const PostCard = memo(PostCardComponent);
