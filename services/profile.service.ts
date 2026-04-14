import { api, unwrapData } from "@/services/api";
import type {
  CompleteProfile,
  CompletionGuide,
  Profile,
} from "@/types/profile";

export interface UpdateProfilePayload {
  name?: string;
  currentRole?: string | null;
  headline?: string | null;
  about?: string | null;
  profileImageUrl?: string | null;
  skills?: string[];
}

export const profileService = {
  getCompleteProfile: async (): Promise<CompleteProfile> => {
    const response = await api.get<unknown>("/user/me/complete");
    return unwrapData<CompleteProfile>(response);
  },

  getCompletionGuide: async (): Promise<CompletionGuide> => {
    const response = await api.get<unknown>("/user/me/completion-guide");
    return unwrapData<CompletionGuide>(response);
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<Profile> => {
    const response = await api.patch<unknown>("/user/update", payload);
    return unwrapData<Profile>(response);
  },
};
