import type { ApiPageInfo } from "@/types/api";

export interface PostAuthor {
  id: string;
  name: string | null;
  email: string;
  trustScore: number;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  user: PostAuthor;
}

export interface PostItem {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user: PostAuthor;
  likeCount: number;
  commentCount: number;
}

export interface PostDetails extends PostItem {
  comments: Comment[];
}

export interface FeedResponse {
  items: PostItem[];
  pageInfo: ApiPageInfo;
}

export interface LikeResponse {
  postId: string;
  liked: boolean;
  likeCount: number;
}
