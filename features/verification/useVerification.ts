"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { verificationService } from "@/services/verification.service";

export const VERIFICATION_PROFILE_QUERY_KEY = ["profile", "complete"] as const;

const verificationStatusKey = (experienceId: string) =>
  ["verification", experienceId] as const;

export const useVerification = (experienceId?: string) => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: VERIFICATION_PROFILE_QUERY_KEY,
    queryFn: profileService.getCompleteProfile,
    staleTime: 20_000,
    retry: 2,
  });

  const statusQuery = useQuery({
    queryKey: experienceId
      ? verificationStatusKey(experienceId)
      : (["verification", "idle"] as const),
    queryFn: async () => {
      if (!experienceId) {
        return null;
      }

      return verificationService.getVerificationStatus(experienceId);
    },
    enabled: Boolean(experienceId),
    staleTime: 10_000,
    refetchInterval: 20_000,
    retry: 2,
  });

  const requestMutation = useMutation({
    mutationFn: verificationService.requestVerification,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: verificationStatusKey(variables.experienceId),
      });
      queryClient.invalidateQueries({ queryKey: VERIFICATION_PROFILE_QUERY_KEY });
    },
  });

  const respondMutation = useMutation({
    mutationFn: verificationService.respondToVerification,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: verificationStatusKey(variables.experienceId),
      });
      queryClient.invalidateQueries({ queryKey: VERIFICATION_PROFILE_QUERY_KEY });
    },
  });

  return {
    profileQuery,
    statusQuery,
    requestMutation,
    respondMutation,
  };
};
