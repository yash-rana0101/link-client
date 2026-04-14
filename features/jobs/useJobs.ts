"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";

export const JOBS_QUERY_KEY = ["jobs"] as const;

export const useJobs = () => {
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: JOBS_QUERY_KEY,
    queryFn: () => jobService.getJobs(50),
    staleTime: 30_000,
    retry: 2,
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => jobService.applyToJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });

  return {
    jobsQuery,
    applyMutation,
  };
};
