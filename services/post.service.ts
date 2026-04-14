import { api, unwrapData } from "@/services/api";
import type { FeedResponse, LikeResponse, PostDetails, PostItem } from "@/types/post";

interface FeedQuery {
  cursor?: string;
  limit?: number;
}

export const postService = {
  getFeed: async ({ cursor, limit = 10 }: FeedQuery = {}): Promise<FeedResponse> => {
    const response = await api.get<unknown>("/posts/feed", {
      params: {
        cursor,
        limit,
      },
    });

    return unwrapData<FeedResponse>(response);
  },

  createPost: async (content: string): Promise<PostItem> => {
    const response = await api.post<unknown>("/posts", {
      content,
    });

    return unwrapData<PostItem>(response);
  },

  getPost: async (postId: string): Promise<PostDetails> => {
    const response = await api.get<unknown>(`/posts/${postId}`);
    return unwrapData<PostDetails>(response);
  },

  likePost: async (postId: string): Promise<LikeResponse> => {
    const response = await api.post<unknown>(`/posts/${postId}/like`);
    return unwrapData<LikeResponse>(response);
  },

  commentOnPost: async (postId: string, content: string): Promise<void> => {
    await api.post(`/posts/${postId}/comment`, {
      content,
    });
  },
};
