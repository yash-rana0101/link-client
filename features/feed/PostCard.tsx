"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/date";
import type { PostItem } from "@/types/post";

export type FeedSignal = "wins" | "proof" | "insights" | "jobs";

interface PostCardProps {
  post: PostItem;
  signal: FeedSignal;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
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

const ActionButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="rounded-lg px-2.5 py-1.5 text-sm text-surface-600 transition-colors duration-200 hover:bg-surface-100 hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {label}
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

  const authorName = post.user.name ?? post.user.email;
  const style = signalStyleMap[signal];

  const handleCommentSubmit = () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      return;
    }

    onComment(post.id, trimmed);
    setComment("");
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

  return (
    <Card className="rounded-2xl border-surface-300 bg-surface-100/95 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-surface-300 bg-white text-sm font-semibold text-surface-700">
            {getInitials(authorName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate font-semibold text-surface-900">{authorName}</p>
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

      <div
        className={[
          "rounded-xl border-l-4 px-3 py-2 text-sm font-medium",
          style.highlightClassName,
        ].join(" ")}
      >
        {buildHighlightText(post, signal)}
      </div>

      <div className="flex flex-wrap items-center gap-1 border-y border-surface-300/90 py-1">
        <ActionButton
          label={isLikePending ? "Saving..." : `Like ${post.likeCount}`}
          onClick={() => onLike(post.id)}
          disabled={isLikePending}
        />
        <ActionButton
          label={`Comment ${post.commentCount}`}
          onClick={() => setShowCommentBox((current) => !current)}
        />
        <ActionButton label="Share" onClick={handleShare} />
        {shareNotice ? <span className="text-xs text-trust-700">{shareNotice}</span> : null}
      </div>

      {showCommentBox ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommentSubmit}
            disabled={isCommentPending || !comment.trim()}
          >
            {isCommentPending ? "Posting..." : "Comment"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

export const PostCard = memo(PostCardComponent);
