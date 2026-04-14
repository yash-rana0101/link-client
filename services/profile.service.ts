import { api, unwrapData } from "@/services/api";
import type {
  CompleteProfile,
  CompletionGuide,
  PublicProfile,
  Profile,
} from "@/types/profile";

export type UploadAssetKind = "PROFILE_IMAGE" | "PROFILE_BANNER";

export interface UploadSignatureResponse {
  kind: UploadAssetKind;
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  publicId: string;
  signature: string;
  uploadUrl: string;
}

export interface UpdateProfilePayload {
  name?: string;
  currentRole?: string | null;
  headline?: string | null;
  about?: string | null;
  profileImageUrl?: string | null;
  profileBannerUrl?: string | null;
  publicProfileUrl?: string | null;
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

  getPublicProfile: async (publicProfileUrl: string): Promise<PublicProfile> => {
    const response = await api.get<unknown>(
      `/user/public/${encodeURIComponent(publicProfileUrl)}`,
    );
    return unwrapData<PublicProfile>(response);
  },

  createUploadSignature: async (kind: UploadAssetKind): Promise<UploadSignatureResponse> => {
    const response = await api.post<unknown>("/user/upload/signature", { kind });
    return unwrapData<UploadSignatureResponse>(response);
  },
};
