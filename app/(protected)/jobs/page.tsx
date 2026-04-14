"use client";

import dynamic from "next/dynamic";

const JobsPage = dynamic(() => import("@/features/jobs/JobsPage"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-surface-300 bg-white p-6 text-sm text-surface-600">
      Loading jobs...
    </div>
  ),
});

export default function JobsRoute() {
  return <JobsPage />;
}
