export interface FollowRecord {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowStatus {
  targetUserId: string;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}
