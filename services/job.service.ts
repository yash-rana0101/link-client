import { api, unwrapData } from "@/services/api";
import type { ApplicationStatus, Job, JobApplication } from "@/types/job";

export const jobService = {
  getJobs: async (limit = 50): Promise<Job[]> => {
    const response = await api.get<unknown>("/jobs", {
      params: {
        limit,
      },
    });

    return unwrapData<Job[]>(response);
  },

  applyToJob: async (jobId: string): Promise<JobApplication> => {
    const response = await api.post<unknown>(`/jobs/${jobId}/apply`);
    return unwrapData<JobApplication>(response);
  },

  getApplications: async (jobId: string): Promise<JobApplication[]> => {
    const response = await api.get<unknown>(`/jobs/${jobId}/applications`);
    return unwrapData<JobApplication[]>(response);
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: Exclude<ApplicationStatus, "APPLIED">,
  ): Promise<JobApplication> => {
    const response = await api.patch<unknown>(
      `/applications/${applicationId}/status`,
      {
        status,
      },
    );

    return unwrapData<JobApplication>(response);
  },
};
