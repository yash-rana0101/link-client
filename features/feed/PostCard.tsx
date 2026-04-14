"use client";

import { memo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/date";
import type { PostItem } from "@/types/post";

interface PostCardProps {
  post: PostItem;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  isLikePending: boolean;
  isCommentPending: boolean;
}

const PostCardComponent = ({
  post,
  onLike,
  onComment,
  isLikePending,
  isCommentPending,
}: PostCardProps) => {
  const [comment, setComment] = useState("");

  const handleCommentSubmit = () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      return;
    }

    onComment(post.id, trimmed);
    setComment("");
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-surface-900">
            {post.user.name ?? post.user.email}
          </p>
          <p className="text-xs text-surface-500">{formatDateTime(post.createdAt)}</p>
        </div>
        <Badge variant="trust">Trust {post.user.trustScore}</Badge>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-surface-800">
        {post.content}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onLike(post.id)}
          disabled={isLikePending}
        >
          {isLikePending ? "Saving..." : `Like (${post.likeCount})`}
        </Button>
        <span className="text-xs text-surface-500">
          Comments: {post.commentCount}
        </span>
      </div>

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
    </Card>
  );
};

export const PostCard = memo(PostCardComponent);
