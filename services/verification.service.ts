import { api, unwrapData } from "@/services/api";
import type {
  RequestVerificationPayload,
  RespondVerificationPayload,
  VerificationOverview,
  VerificationRequestResult,
  VerificationResponseResult,
} from "@/types/verification";

export const verificationService = {
  requestVerification: async (
    payload: RequestVerificationPayload,
  ): Promise<VerificationRequestResult> => {
    const response = await api.post<unknown>("/verification/request", payload);
    return unwrapData<VerificationRequestResult>(response);
  },

  respondToVerification: async (
    payload: RespondVerificationPayload,
  ): Promise<VerificationResponseResult> => {
    const response = await api.post<unknown>("/verification/respond", payload);
    return unwrapData<VerificationResponseResult>(response);
  },

  getVerificationStatus: async (
    experienceId: string,
  ): Promise<VerificationOverview> => {
    const response = await api.get<unknown>(`/verification/${experienceId}`);
    return unwrapData<VerificationOverview>(response);
  },
};
