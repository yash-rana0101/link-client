"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  profileService,
  type UpdateProfilePayload,
} from "@/services/profile.service";
import { persistSession, readStoredSession } from "@/services/session";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";

export const PROFILE_QUERY_KEY = ["profile", "complete"] as const;
export const PROFILE_GUIDE_QUERY_KEY = ["profile", "completion-guide"] as const;
export const PROFILE_VIEWS_QUERY_KEY = ["profile", "views"] as const;
export const PUBLIC_PROFILE_QUERY_KEY = "profile-public";

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

  const profileViewsQuery = useQuery({
    queryKey: PROFILE_VIEWS_QUERY_KEY,
    queryFn: () => profileService.getProfileViews(20),
    staleTime: 30_000,
    retry: 2,
  });

  return {
    profileQuery,
    guideQuery,
    profileViewsQuery,
  };
};

export const useUpdateProfile = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileService.updateProfile(payload),
    onSuccess: (profile) => {
      const currentUser = authState.user;

      if (currentUser) {
        const nextUser = {
          ...currentUser,
          name: profile.name,
          currentRole: profile.currentRole,
          location: profile.location,
          headline: profile.headline,
          about: profile.about,
          profileImageUrl: profile.profileImageUrl,
          profileBannerUrl: profile.profileBannerUrl,
          publicProfileUrl: profile.publicProfileUrl,
        };

        dispatch(updateUser(nextUser));

        const existingSession = readStoredSession();

        if (existingSession) {
          persistSession({
            ...existingSession,
            user: nextUser,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_GUIDE_QUERY_KEY });
    },
  });
};

export const usePublicProfile = (publicProfileUrl: string | null | undefined) => {
  const normalizedPublicProfileUrl = publicProfileUrl?.trim() ?? "";

  return useQuery({
    queryKey: [PUBLIC_PROFILE_QUERY_KEY, normalizedPublicProfileUrl],
    queryFn: () => profileService.getPublicProfile(normalizedPublicProfileUrl),
    enabled: normalizedPublicProfileUrl.length > 0,
    retry: 1,
  });
};
