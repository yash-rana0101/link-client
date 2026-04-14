"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  profileService,
  type UpdateProfilePayload,
} from "@/services/profile.service";

export const PROFILE_QUERY_KEY = ["profile", "complete"] as const;
export const PROFILE_GUIDE_QUERY_KEY = ["profile", "completion-guide"] as const;

export const useProfile = () => {
  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileService.getCompleteProfile,
    staleTime: 60_000,
    retry: 2,
  });

  const guideQuery = useQuery({
    queryKey: PROFILE_GUIDE_QUERY_KEY,
    queryFn: profileService.getCompletionGuide,
    staleTime: 60_000,
    retry: 2,
  });

  return {
    profileQuery,
    guideQuery,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_GUIDE_QUERY_KEY });
    },
  });
};
