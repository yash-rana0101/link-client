import { api, unwrapData } from "@/services/api";
import type { CreateProfileReportPayload, ProfileReportRecord } from "@/types/report";

export const reportService = {
  createProfileReport: async (payload: CreateProfileReportPayload): Promise<ProfileReportRecord> => {
    const response = await api.post<unknown>("/reports/profile", payload);
    return unwrapData<ProfileReportRecord>(response);
  },
};
