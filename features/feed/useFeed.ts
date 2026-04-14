"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";

export const FEED_QUERY_KEY = ["feed"] as const;

export const useFeed = () => {
  const queryClient = useQueryClient();

  const feedQuery = useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      postService.getFeed({
        cursor: pageParam,
        limit: 10,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pageInfo.hasMore || !lastPage.pageInfo.nextCursor) {
        return undefined;
      }

      return lastPage.pageInfo.nextCursor;
    },
    retry: 2,
  });

  const createPostMutation = useMutation({
    mutationFn: (content: string) => postService.createPost(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => postService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      postService.commentOnPost(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });

  const posts = feedQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    feedQuery,
    posts,
    createPostMutation,
    likeMutation,
    commentMutation,
  };
};
