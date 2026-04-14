import { api, unwrapData } from "@/services/api";
import type { Comment, FeedResponse, LikeResponse, PostDetails, PostItem } from "@/types/post";

interface FeedQuery {
  cursor?: string;
  limit?: number;
}

interface CreatePostPayload {
  content: string;
  imageUrl?: string | null;
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

  createPost: async ({ content, imageUrl }: CreatePostPayload): Promise<PostItem> => {
    const response = await api.post<unknown>("/posts", {
      content,
      ...(imageUrl ? { imageUrl } : {}),
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

  commentOnPost: async (postId: string, content: string): Promise<Comment> => {
    const response = await api.post<unknown>(`/posts/${postId}/comment`, {
      content,
    });

    return unwrapData<Comment>(response);
  },
};
