"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { FEED_QUERY_KEY } from "@/features/feed/useFeed";
import { PROFILE_QUERY_KEY, PUBLIC_PROFILE_QUERY_KEY } from "@/features/profile/useProfile";
import { postService } from "@/services/post.service";
import type { Comment, LikeResponse } from "@/types/post";
import type { LightweightPost } from "@/types/profile";

interface ProfilePostSectionsProps {
  authorName: string;
  authorImageUrl: string | null;
  authorPublicProfileUrl?: string | null;
  authorTrustScore?: number;
  featuredPost: LightweightPost | null;
  posts: LightweightPost[];
  followersCount: number;
  isOwner?: boolean;
  isFollowing?: boolean;
  isFollowPending?: boolean;
  onToggleFollow?: () => void;
}

interface ActivityPostCardProps {
  post: LightweightPost;
  authorName: string;
  authorImageUrl: string | null;
  authorPublicProfileUrl?: string | null;
  likeCountOverride?: number;
  onLike: (postId: string) => Promise<LikeResponse>;
  onComment: (postId: string, content: string) => Promise<Comment>;
  isLikePending: boolean;
  isCommentPending: boolean;
}

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

const formatRelative = (value: string) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "recent";
  }

  const elapsed = Date.now() - parsed.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsed < hour) {
    return `${Math.max(1, Math.floor(elapsed / minute))}m`;
  }

  if (elapsed < day) {
    return `${Math.max(1, Math.floor(elapsed / hour))}h`;
  }

  return `${Math.max(1, Math.floor(elapsed / day))}d`;
};

const ReactionIcon = ({ className }: { className?: string }) => (
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

const RepostIcon = ({ className }: { className?: string }) => (
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
    <path d="M4.5 7.5h11" />
    <path d="m12 4.5 3 3-3 3" />
    <path d="M19.5 16.5h-11" />
    <path d="m12 13.5-3 3 3 3" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
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
    <path d="M21 3 10.5 13.5" />
    <path d="m21 3-6.5 18-4-7.5-7.5-4L21 3Z" />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ActivityPostCard = ({
  post,
  authorName,
  authorImageUrl,
  authorPublicProfileUrl,
  likeCountOverride,
  onLike,
  onComment,
  isLikePending,
  isCommentPending,
}: ActivityPostCardProps) => {
  const authorHref = authorPublicProfileUrl ? `/in/${authorPublicProfileUrl}` : null;
  const preview = post.content.length > 265 ? `${post.content.slice(0, 262)}...` : post.content;
  const likeCount = likeCountOverride ?? post.likeCount;

  const handleQuickComment = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const draft = window.prompt("Add a comment");
    const normalized = draft?.trim();

    if (!normalized) {
      return;
    }

    await onComment(post.id, normalized);
  };

  return (
    <article className="h-full overflow-hidden rounded-xl border border-surface-200 bg-white">
      <div className="px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            {authorHref ? (
              <Link
                href={authorHref}
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-[11px] font-semibold text-surface-700"
              >
                {authorImageUrl ? (
                  <img src={authorImageUrl} alt={authorName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(authorName)
                )}
              </Link>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-[11px] font-semibold text-surface-700">
                {authorImageUrl ? (
                  <img src={authorImageUrl} alt={authorName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(authorName)
                )}
              </div>
            )}

            <div className="min-w-0">
              {authorHref ? (
                <Link href={authorHref} className="truncate text-sm font-semibold text-surface-900 hover:text-trust-700">
                  {authorName}
                </Link>
              ) : (
                <p className="truncate text-sm font-semibold text-surface-900">{authorName}</p>
              )}
              <p className="text-xs text-surface-500">{formatRelative(post.createdAt)} • 🌐</p>
            </div>
          </div>

          <button type="button" className="text-surface-500">•••</button>
        </div>

        <p className="mt-3 max-h-44 overflow-hidden whitespace-pre-wrap text-sm leading-relaxed text-surface-800">{preview}</p>

        {post.imageUrl ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-surface-200">
            <img src={post.imageUrl} alt="Post attachment" className="max-h-36 w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-3 flex items-center gap-1 text-xs text-surface-600">
          <ReactionIcon className="h-3.5 w-3.5 text-trust-600" />
          <span>{likeCount}</span>
          <span>•</span>
          <span>{post.commentCount} comments</span>
        </div>
      </div>

      <div className="grid grid-cols-4 border-t border-surface-200 text-surface-600">
        <button
          type="button"
          onClick={() => void onLike(post.id)}
          disabled={isLikePending}
          className="inline-flex items-center justify-center px-2 py-2 hover:bg-surface-100 disabled:opacity-60"
          aria-label="Like post"
        >
          <ReactionIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => void handleQuickComment()}
          disabled={isCommentPending}
          className="inline-flex items-center justify-center px-2 py-2 hover:bg-surface-100 disabled:opacity-60"
          aria-label="Comment on post"
        >
          <CommentIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center px-2 py-2 hover:bg-surface-100"
          aria-label="Repost"
        >
          <RepostIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center px-2 py-2 hover:bg-surface-100"
          aria-label="Send post"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

export const ProfilePostSections = ({
  authorName,
  authorImageUrl,
  authorPublicProfileUrl,
  featuredPost,
  posts,
  followersCount,
  isOwner,
  isFollowing,
  isFollowPending,
  onToggleFollow,
}: ProfilePostSectionsProps) => {
  const queryClient = useQueryClient();
  const [activeSlide, setActiveSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(3);
  const [activeLikePostId, setActiveLikePostId] = useState<string | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [likeOverrides, setLikeOverrides] = useState<Record<string, number>>({});

  const activityPosts = useMemo(() => {
    if (!featuredPost) {
      return posts;
    }

    const remaining = posts.filter((post) => post.id !== featuredPost.id);
    return [featuredPost, ...remaining];
  }, [featuredPost, posts]);

  const invalidatePostQueries = async (postId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: [PUBLIC_PROFILE_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ["post", postId] }),
    ]);
  };

  const likeMutation = useMutation({
    mutationFn: (postId: string) => postService.likePost(postId),
    onSuccess: (response, postId) => {
      setLikeOverrides((current) => ({
        ...current,
        [postId]: response.likeCount,
      }));

      return invalidatePostQueries(postId);
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      postService.commentOnPost(postId, content),
    onSuccess: (_comment, variables) => invalidatePostQueries(variables.postId),
  });

  const handleLike = async (postId: string): Promise<LikeResponse> => {
    setActiveLikePostId(postId);

    try {
      return await likeMutation.mutateAsync(postId);
    } finally {
      setActiveLikePostId((current) => (current === postId ? null : current));
    }
  };

  const handleComment = async (postId: string, content: string): Promise<Comment> => {
    setActiveCommentPostId(postId);

    try {
      return await commentMutation.mutateAsync({ postId, content });
    } finally {
      setActiveCommentPostId((current) => (current === postId ? null : current));
    }
  };

  useEffect(() => {
    const calculateCardsPerSlide = () => {
      if (window.innerWidth < 768) {
        setCardsPerSlide(1);
        return;
      }

      if (window.innerWidth < 1240) {
        setCardsPerSlide(2);
        return;
      }

      setCardsPerSlide(3);
    };

    calculateCardsPerSlide();
    window.addEventListener("resize", calculateCardsPerSlide);

    return () => {
      window.removeEventListener("resize", calculateCardsPerSlide);
    };
  }, []);

  const maxSlideIndex = Math.max(0, activityPosts.length - cardsPerSlide);

  useEffect(() => {
    if (!activityPosts.length) {
      setActiveSlide(0);
      return;
    }

    setActiveSlide((current) => Math.min(current, maxSlideIndex));
  }, [activityPosts.length, maxSlideIndex]);

  const showCarouselControls = activityPosts.length > cardsPerSlide;
  const isAtFirstSlide = activeSlide <= 0;
  const isAtLastSlide = activeSlide >= maxSlideIndex;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4">
        <div>
          <h3 className="text-3xl font-semibold leading-none text-surface-900">Activity</h3>
          <p className="mt-2 text-sm font-medium text-surface-600">{followersCount.toLocaleString()} followers</p>
        </div>

        {!isOwner ? (
          <button
            type="button"
            onClick={onToggleFollow}
            disabled={isFollowPending || !onToggleFollow}
            className={[
              "inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors duration-200",
              isFollowing
                ? "border-trust-500 bg-trust-50 text-trust-700 hover:bg-trust-100"
                : "border-surface-400 text-surface-700 hover:bg-surface-100",
              isFollowPending || !onToggleFollow ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            {isFollowPending ? "Saving..." : isFollowing ? "Unfollow" : "+ Follow"}
          </button>
        ) : null}
      </div>

      {activityPosts.length ? (
        <>
          <div className="relative px-3 py-4 sm:px-4">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeSlide * (100 / cardsPerSlide)}%)` }}
              >
                {activityPosts.map((post) => (
                  <div key={post.id} style={{ flex: `0 0 ${100 / cardsPerSlide}%` }} className="px-1.5">
                    <ActivityPostCard
                      post={post}
                      authorName={authorName}
                      authorImageUrl={authorImageUrl}
                      authorPublicProfileUrl={authorPublicProfileUrl}
                      likeCountOverride={likeOverrides[post.id]}
                      onLike={handleLike}
                      onComment={handleComment}
                      isLikePending={likeMutation.isPending && activeLikePostId === post.id}
                      isCommentPending={commentMutation.isPending && activeCommentPostId === post.id}
                    />
                  </div>
                ))}
              </div>
            </div>

            {showCarouselControls ? (
              <>
                <button
                  type="button"
                  aria-label="Previous posts"
                  onClick={() => setActiveSlide((current) => Math.max(0, current - 1))}
                  disabled={isAtFirstSlide}
                  className="absolute left-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-surface-300 bg-white text-surface-700 shadow disabled:opacity-40"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next posts"
                  onClick={() => setActiveSlide((current) => Math.min(maxSlideIndex, current + 1))}
                  disabled={isAtLastSlide}
                  className="absolute right-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-surface-300 bg-white text-surface-700 shadow disabled:opacity-40"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-1 border-t border-surface-200 py-3 text-sm font-semibold text-surface-700 transition-colors duration-200 hover:bg-surface-50"
          >
            Show all
            <span aria-hidden="true">→</span>
          </button>
        </>
      ) : (
        <p className="px-5 py-4 text-sm text-surface-600">No posts shared yet.</p>
      )}
    </Card>
  );
};
