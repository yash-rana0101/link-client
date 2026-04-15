import { api, unwrapData } from "@/services/api";
import type { FollowRecord, FollowStatus } from "@/types/follow";

export const followService = {
  followUser: async (userId: string): Promise<FollowRecord> => {
    const response = await api.post<unknown>(`/follows/${encodeURIComponent(userId)}`);
    return unwrapData<FollowRecord>(response);
  },

  unfollowUser: async (userId: string): Promise<void> => {
    await api.delete(`/follows/${encodeURIComponent(userId)}`, {
      data: {},
    });
  },

  getFollowStatus: async (userId: string): Promise<FollowStatus> => {
    const response = await api.get<unknown>(`/follows/${encodeURIComponent(userId)}/status`);
    return unwrapData<FollowStatus>(response);
  },
};
