"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { JobCard } from "@/features/jobs/JobCard";
import { useJobs } from "@/features/jobs/useJobs";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const { jobsQuery, applyMutation } = useJobs();

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return jobsQuery.data ?? [];
    }

    return (jobsQuery.data ?? []).filter((job) =>
      [job.title, job.description, job.location ?? ""].join(" ").toLowerCase().includes(term),
    );
  }, [jobsQuery.data, search]);

  if (jobsQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (jobsQuery.isError) {
    return (
      <ErrorState
        title="Jobs unavailable"
        description="We could not load current openings."
        action={<Button onClick={() => jobsQuery.refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Trusted Opportunities</h2>
          <p className="text-sm text-surface-600">
            Role listings powered by verified professional graphs.
          </p>
        </div>
        <Input
          className="max-w-xs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search roles or locations"
        />
      </div>

      {filteredJobs.length ? (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={(jobId) => applyMutation.mutate(jobId)}
              isApplying={applyMutation.isPending && applyMutation.variables === job.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching jobs"
          description="Try another keyword or broaden your location filter."
        />
      )}
    </section>
  );
}
