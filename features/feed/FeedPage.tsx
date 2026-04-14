"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { PostCard } from "@/features/feed/PostCard";
import { PostComposer } from "@/features/feed/PostComposer";
import { useFeed } from "@/features/feed/useFeed";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

export default function FeedPage() {
  const { feedQuery, posts, createPostMutation, likeMutation, commentMutation } =
    useFeed();

  const canLoadMore = Boolean(feedQuery.hasNextPage && !feedQuery.isFetchingNextPage);

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
        feedQuery.fetchNextPage();
      }
    },
    canLoadMore,
  );

  const likePendingPostId = useMemo(
    () => (typeof likeMutation.variables === "string" ? likeMutation.variables : null),
    [likeMutation.variables],
  );

  const commentPendingPostId = useMemo(
    () => commentMutation.variables?.postId ?? null,
    [commentMutation.variables],
  );

  if (feedQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (feedQuery.isError) {
    return (
      <ErrorState
        title="Feed unavailable"
        description="We could not load the current feed."
        action={<Button onClick={() => feedQuery.refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <section className="space-y-4">
      <PostComposer
        onCreatePost={(content) => createPostMutation.mutate(content)}
        isSubmitting={createPostMutation.isPending}
      />

      {posts.length ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={(postId) => likeMutation.mutate(postId)}
              onComment={(postId, content) =>
                commentMutation.mutate({ postId, content })
              }
              isLikePending={likeMutation.isPending && likePendingPostId === post.id}
              isCommentPending={
                commentMutation.isPending && commentPendingPostId === post.id
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Feed is quiet"
          description="Start by sharing your first trusted update."
        />
      )}

      <div ref={loadMoreRef} className="flex h-8 items-center justify-center">
        {feedQuery.isFetchingNextPage ? <Spinner /> : null}
      </div>
    </section>
  );
}
